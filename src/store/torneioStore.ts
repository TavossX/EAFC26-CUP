import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import type {
  Torneio,
  Participante,
  Partida,
  ConfiguracaoTorneio,
  FaseMataMata,
} from '../types/torneio';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Próxima potência de 2 (para o bracket) */
function proximaPotenciaDe2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/** Gera partidas Round-Robin (ida e volta) */
function gerarPartidasLiga(
  participantes: Participante[],
  torneioId: string
): Partida[] {
  const partidas: Partida[] = [];
  const n = participantes.length;
  // Duplica a lista para ter sempre número par
  const lista = n % 2 === 0 ? [...participantes] : [...participantes, null];
  const total = lista.length;
  const rodadas = total - 1;

  // Ida
  for (let r = 0; r < rodadas; r++) {
    for (let i = 0; i < total / 2; i++) {
      const a = lista[i];
      const b = lista[total - 1 - i];
      if (!a || !b) continue;
      partidas.push(criarPartidaLiga(torneioId, a.id, b.id, r + 1));
    }
    // Rotaciona (menos o primeiro elemento)
    lista.splice(1, 0, lista.pop()!);
  }

  // Volta (inversão de casa/fora)
  const idaPartidas = [...partidas];
  idaPartidas.forEach((p, idx) => {
    partidas.push(criarPartidaLiga(torneioId, p.participanteBId, p.participanteAId, rodadas + idx + 1));
  });

  return partidas;
}

function criarPartidaLiga(
  torneioId: string,
  aId: string,
  bId: string,
  rodada: number
): Partida {
  return {
    id: uuidv4(),
    torneioId,
    rodada,
    fase: null,
    participanteAId: aId,
    participanteBId: bId,
    placarA: null,
    placarB: null,
    finalizada: false,
    jogo: null,
    confrontoId: null,
    penaltisA: null,
    penaltisB: null,
    vencedorId: null,
  };
}

/** Gera bracket mata-mata (ida e volta por fase) */
function gerarPartidasMataMata(
  participantes: Participante[],
  torneioId: string
): Partida[] {
  const partidas: Partida[] = [];
  const totalSlots = proximaPotenciaDe2(participantes.length);
  const shuffled = shuffle(participantes);

  // Preenche com "byes" (null) se necessário
  const slots: (Participante | null)[] = [...shuffled];
  while (slots.length < totalSlots) slots.push(null);

  const fases: FaseMataMata[] = ['oitavas', 'quartas', 'semifinal', 'final'];
  const faseIdx = Math.log2(totalSlots) - 1; // ex: 8 slots → faseIdx=2 (quartas)
  const fase = fases[Math.max(0, faseIdx - 1)] ?? 'quartas';

  // Cria confrontos da primeira fase (ida+volta para cada par)
  for (let i = 0; i < totalSlots; i += 2) {
    const a = slots[i];
    const b = slots[i + 1];
    if (!a) continue; // bye automático
    if (!b) {
      // Bye: a avança automaticamente (placar 1x0 fictício)
      const confrontoId = uuidv4();
      partidas.push({
        id: uuidv4(), torneioId, rodada: 0, fase,
        participanteAId: a.id, participanteBId: 'BYE',
        placarA: 1, placarB: 0, finalizada: true,
        jogo: 'ida', confrontoId, penaltisA: null, penaltisB: null,
        vencedorId: a.id,
      });
      continue;
    }
    const confrontoId = uuidv4();
    // Jogo de ida
    partidas.push({
      id: uuidv4(), torneioId, rodada: 0, fase,
      participanteAId: a.id, participanteBId: b.id,
      placarA: null, placarB: null, finalizada: false,
      jogo: 'ida', confrontoId, penaltisA: null, penaltisB: null,
      vencedorId: null,
    });
    // Jogo de volta (mandos invertidos)
    partidas.push({
      id: uuidv4(), torneioId, rodada: 0, fase,
      participanteAId: b.id, participanteBId: a.id,
      placarA: null, placarB: null, finalizada: false,
      jogo: 'volta', confrontoId, penaltisA: null, penaltisB: null,
      vencedorId: null,
    });
  }

  return partidas;
}

// ─── Tipos da store ──────────────────────────────────────────────────────────

interface TorneioState {
  torneio: Torneio | null;
  participantes: Participante[];
  partidas: Partida[];

  // Actions
  criarTorneio: (config: ConfiguracaoTorneio) => void;
  registrarPlacarLiga: (partidaId: string, placarA: number, placarB: number) => void;
  registrarPlacarMataMata: (
    partidaId: string,
    placarA: number,
    placarB: number,
    penaltisA?: number,
    penaltisB?: number
  ) => void;
  publicarTorneio: () => Promise<string | null>;                           // salva no Supabase e retorna URL
  carregarTorneioPublico: (id: string) => Promise<boolean>;                // carrega do Supabase (somente leitura)
  resetarTorneio: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useTorneioStore = create<TorneioState>()(
  devtools(
    (set, get) => ({
      torneio: null,
      participantes: [],
      partidas: [],

      /* ── Criar torneio ─────────────────────────────────────── */
      criarTorneio: (config) => {
        const torneioId = uuidv4();
        const torneio: Torneio = {
          id: torneioId,
          nome: config.nome,
          formato: config.formato,
          status: 'em_andamento',
          criadoEm: new Date().toISOString(),
        };

        const participantes: Participante[] = config.duplas.map((dupla) => ({
          id: uuidv4(),
          torneioId,
          nomeAmigo: dupla.amigo,
          timeSorteado: dupla.time,
          pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0,
          golsPro: 0, golsContra: 0,
        }));

        const partidas =
          config.formato === 'liga'
            ? gerarPartidasLiga(participantes, torneioId)
            : gerarPartidasMataMata(participantes, torneioId);

        set({ torneio, participantes, partidas });
      },

      /* ── Registrar placar (Liga) ───────────────────────────── */
      registrarPlacarLiga: (partidaId, placarA, placarB) => {
        const { partidas, participantes } = get();
        const partida = partidas.find((p) => p.id === partidaId);
        if (!partida || partida.finalizada) return;

        const novasPartidas = partidas.map((p) =>
          p.id === partidaId
            ? { ...p, placarA, placarB, finalizada: true,
                vencedorId: placarA > placarB ? p.participanteAId
                           : placarB > placarA ? p.participanteBId : null }
            : p
        );

        // Recalcula estatísticas de todos os participantes do zero
        const stats = new Map(
          participantes.map((p) => [
            p.id,
            { pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0 },
          ])
        );

        novasPartidas
          .filter((p) => p.finalizada && p.placarA !== null && p.placarB !== null)
          .forEach((p) => {
            const sa = stats.get(p.participanteAId);
            const sb = stats.get(p.participanteBId);
            if (!sa || !sb) return;

            sa.jogos++; sb.jogos++;
            sa.golsPro += p.placarA!; sb.golsContra += p.placarA!;
            sb.golsPro += p.placarB!; sa.golsContra += p.placarB!;

            if (p.placarA! > p.placarB!) {
              sa.vitorias++; sa.pontos += 3;
              sb.derrotas++;
            } else if (p.placarA! < p.placarB!) {
              sb.vitorias++; sb.pontos += 3;
              sa.derrotas++;
            } else {
              sa.empates++; sa.pontos++;
              sb.empates++; sb.pontos++;
            }
          });

        const novosParticipantes = participantes.map((p) => ({
          ...p,
          ...stats.get(p.id),
        }));

        set({ partidas: novasPartidas, participantes: novosParticipantes });
      },

      /* ── Registrar placar (Mata-mata) ──────────────────────── */
      registrarPlacarMataMata: (partidaId, placarA, placarB, penaltisA, penaltisB) => {
        const { partidas, participantes } = get();
        const partida = partidas.find((p) => p.id === partidaId);
        if (!partida || partida.finalizada) return;

        // Atualiza a partida
        let novasPartidas = partidas.map((p) =>
          p.id === partidaId
            ? { ...p, placarA, placarB, finalizada: true,
                penaltisA: penaltisA ?? null, penaltisB: penaltisB ?? null }
            : p
        );

        // Se for volta, calcula o agregado e determina o vencedor do confronto
        if (partida.jogo === 'volta' && partida.confrontoId) {
          const confronto = novasPartidas.filter(
            (p) => p.confrontoId === partida.confrontoId
          );
          const idaPartida  = confronto.find((p) => p.jogo === 'ida');
          const voltaPartida = confronto.find((p) => p.jogo === 'volta');

          if (idaPartida?.finalizada && voltaPartida?.finalizada) {
            // No jogo de ida: A joga em casa contra B
            // No jogo de volta: B joga em casa contra A (participantes invertidos!)
            // idaPartida.participanteAId = time A original
            const aId = idaPartida.participanteAId;
            const bId = idaPartida.participanteBId;

            const golsA_total = (idaPartida.placarA ?? 0) + (voltaPartida.placarB ?? 0);
            const golsB_total = (idaPartida.placarB ?? 0) + (voltaPartida.placarA ?? 0);

            let vencedorId: string | null = null;

            if (golsA_total !== golsB_total) {
              vencedorId = golsA_total > golsB_total ? aId : bId;
            } else if (penaltisA !== undefined && penaltisB !== undefined) {
              vencedorId = penaltisA > penaltisB ? aId : bId;
            }

            // Propaga vencedor para próxima fase
            if (vencedorId) {
              novasPartidas = novasPartidas.map((p) =>
                p.confrontoId === partida.confrontoId
                  ? { ...p, vencedorId }
                  : p
              );

              // Cria partidas da próxima fase se todos os confrontos desta fase estiverem resolvidos
              novasPartidas = criarProximaFaseSeNecessario(
                novasPartidas, partida.fase!, partida.torneioId, participantes
              );
            }
          }
        }

        set({ partidas: novasPartidas });
      },

      /* ── Publicar torneio no Supabase ─────────────────────── */
      publicarTorneio: async () => {
        const { torneio, participantes, partidas } = get();
        if (!torneio) return null;

        const payload = {
          id: torneio.id,
          nome: torneio.nome,
          formato: torneio.formato,
          status: torneio.status,
          dados: { torneio, participantes, partidas },  // JSONB snapshot completo
          atualizado_em: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('torneios_publicos')
          .upsert(payload, { onConflict: 'id' });

        if (error) {
          console.error('Erro ao publicar torneio:', error.message);
          return null;
        }

        return `${window.location.origin}/convite/${torneio.id}`;
      },

      /* ── Carregar torneio público do Supabase ──────────────── */
      carregarTorneioPublico: async (id: string) => {
        const { data, error } = await supabase
          .from('torneios_publicos')
          .select('dados')
          .eq('id', id)
          .single();

        if (error || !data?.dados) return false;

        const { torneio, participantes, partidas } = data.dados as TorneioState;
        set({ torneio, participantes, partidas });
        return true;
      },

      /* ── Resetar ───────────────────────────────────────────── */
      resetarTorneio: () => set({ torneio: null, participantes: [], partidas: [] }),
    }),
    { name: 'copa-de-amigos' }
  )
);

// ─── Helper: cria partidas da próxima fase do bracket ────────────────────────

const ORDEM_FASES: FaseMataMata[] = ['oitavas', 'quartas', 'semifinal', 'final'];

function criarProximaFaseSeNecessario(
  partidas: Partida[],
  faseAtual: FaseMataMata,
  torneioId: string,
  participantes: Participante[]
): Partida[] {
  const confrontosDaFase = partidas.filter(
    (p) => p.fase === faseAtual && p.jogo === 'volta'
  );

  const todosResolvidos = confrontosDaFase.every((p) => p.vencedorId);
  if (!todosResolvidos) return partidas;

  const idxAtual = ORDEM_FASES.indexOf(faseAtual);
  if (idxAtual >= ORDEM_FASES.length - 1) return partidas; // já é a final

  const proximaFase = ORDEM_FASES[idxAtual + 1];
  const jaExisteProximaFase = partidas.some((p) => p.fase === proximaFase);
  if (jaExisteProximaFase) return partidas;

  const vencedores = confrontosDaFase.map((p) =>
    participantes.find((part) => part.id === p.vencedorId)!
  ).filter(Boolean);

  const novasPartidas: Partida[] = [];
  for (let i = 0; i < vencedores.length; i += 2) {
    const a = vencedores[i];
    const b = vencedores[i + 1];
    if (!a || !b) continue;
    const confrontoId = uuidv4();
    novasPartidas.push(
      {
        id: uuidv4(), torneioId, rodada: idxAtual + 1, fase: proximaFase,
        participanteAId: a.id, participanteBId: b.id,
        placarA: null, placarB: null, finalizada: false,
        jogo: 'ida', confrontoId, penaltisA: null, penaltisB: null, vencedorId: null,
      },
      {
        id: uuidv4(), torneioId, rodada: idxAtual + 1, fase: proximaFase,
        participanteAId: b.id, participanteBId: a.id,
        placarA: null, placarB: null, finalizada: false,
        jogo: 'volta', confrontoId, penaltisA: null, penaltisB: null, vencedorId: null,
      }
    );
  }

  return [...partidas, ...novasPartidas];
}
