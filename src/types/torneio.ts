// ─── Tipos compartilhados do domínio Copa de Amigos ──────────────────────────

export type FormatoTorneio = 'liga' | 'matamata';
export type StatusTorneio  = 'configurando' | 'em_andamento' | 'finalizado';
export type TipoJogo       = 'ida' | 'volta' | null;
export type FaseMataMata   = 'oitavas' | 'quartas' | 'semifinal' | 'final';

export interface Torneio {
  id: string;
  nome: string;
  formato: FormatoTorneio;
  status: StatusTorneio;
  criadoEm: string;
  idaEVolta: boolean;          // true = turno duplo / confronto dois jogos
}

export interface Participante {
  id: string;
  torneioId: string;
  nomeAmigo: string;
  timeSorteado: string;
  // Estatísticas (Liga)
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
}

export interface Partida {
  id: string;
  torneioId: string;
  rodada: number;                      // Liga: número da rodada | Mata-mata: índice de fase
  fase: FaseMataMata | null;           // Mata-mata: fase da partida
  participanteAId: string;
  participanteBId: string;
  placarA: number | null;
  placarB: number | null;
  finalizada: boolean;
  // Mata-mata extra
  jogo: TipoJogo;                      // 'ida' | 'volta' | null (liga)
  confrontoId: string | null;          // agrupa ida+volta do mesmo par
  penaltisA: number | null;            // só preenchido em caso de empate agregado
  penaltisB: number | null;
  vencedorId: string | null;           // calculado automaticamente
}

export interface ConfiguracaoTorneio {
  nome: string;
  formato: FormatoTorneio;
  idaEVolta: boolean;          // true = turno duplo / confronto dois jogos
  duplas: { amigo: string; time: string }[];
}
