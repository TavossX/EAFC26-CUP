import {
  Badge,
  Box,
  Divider,
  Flex,
  HStack,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useTorneioStore } from '../store/torneioStore';
import type { FaseMataMata, Partida } from '../types/torneio';
import { ModalPlacar } from './ModalPlacar';

// ─── Constantes ─────────────────────────────────────────────────────
const FASES_LABEL: Record<FaseMataMata, string> = {
  oitavas:        'Oitavas de Final',
  quartas:        'Quartas de Final',
  semifinal:      'Semifinal',
  final:          'Final',
  terceiro_lugar: 'Disputa de 3º Lugar',
};

// Ordem do bracket horizontal (terceiro_lugar fica fora)
const ORDEM_FASES: FaseMataMata[] = ['oitavas', 'quartas', 'semifinal', 'final'];

// ─── Card de partida (ida ou volta) ──────────────────────────────────────────
function CardPartida({
  partida,
  onAbrir,
}: {
  partida: Partida;
  onAbrir: (partida: Partida) => void;
}) {
  const { participantes } = useTorneioStore();

  const pA = participantes.find((p) => p.id === partida.participanteAId);
  const pB = participantes.find((p) => p.id === partida.participanteBId);
  const isBye = partida.participanteBId === 'BYE';

  const aVenceu = partida.vencedorId === partida.participanteAId;
  const bVenceu = partida.vencedorId === partida.participanteBId;

  return (
    <Box
      borderRadius="2px"
      borderWidth={1}
      borderColor={partida.finalizada ? 'brand.dark' : 'brand.dark'}
      bg={partida.finalizada ? 'blackAlpha.50' : 'brand.surfaceLight'}
      _dark={{ borderColor: partida.finalizada ? 'whiteAlpha.300' : 'whiteAlpha.400', bg: partida.finalizada ? 'whiteAlpha.50' : 'brand.surfaceDark' }}
      p={0}
      overflow="hidden"
      cursor={partida.finalizada ? 'default' : 'pointer'}
      onClick={() => !partida.finalizada && !isBye && onAbrir(partida)}
      transition="all 0.2s"
      _hover={
        !partida.finalizada && !isBye
          ? { borderColor: 'brand.orange' }
          : {}
      }
      minW="180px"
      w="full"
    >
      {/* Label jogo de ida/volta/unico */}
      <Flex
        bg={partida.finalizada ? 'transparent' : 'blackAlpha.100'}
        borderBottomWidth={1}
        borderColor="brand.dark"
        _dark={{ bg: partida.finalizada ? 'transparent' : 'whiteAlpha.100', borderColor: 'whiteAlpha.300' }}
        px={3} py={1}
        justify="space-between"
        align="center"
      >
        <Text fontSize="2xs" opacity={0.6} fontWeight={700} textTransform="uppercase">
          {partida.jogo === 'ida' ? 'Jogo de Ida' : partida.jogo === 'volta' ? 'Jogo de Volta' : 'Jogo Único'}
        </Text>
        {partida.finalizada ? (
          <Badge variant="outline" borderRadius="2px" fontSize="2xs">Finalizado</Badge>
        ) : (
          <Badge variant="solid" bg="brand.orange" color="brand.dark" borderRadius="2px" fontSize="2xs">Lançar Placar</Badge>
        )}
      </Flex>

      {/* Participante A */}
      <Flex px={3} py={2} justify="space-between" align="center"
        bg={aVenceu ? 'rgba(217,119,6,0.1)' : 'transparent'}
      >
        <VStack align="flex-start" spacing={0}>
          <Text
            fontWeight={aVenceu ? 700 : 500}
            opacity={bVenceu ? 0.4 : 1}
            fontSize="sm" noOfLines={1}
          >
            {pA?.nomeAmigo ?? '?'}
          </Text>
          <Text fontSize="2xs" opacity={0.6}>{pA?.timeSorteado ?? '—'}</Text>
        </VStack>
        <Text
          fontWeight={800} fontSize="lg"
          opacity={bVenceu ? 0.4 : 1}
        >
          {partida.placarA ?? '—'}
        </Text>
      </Flex>

      <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} />

      {/* Participante B */}
      <Flex px={3} py={2} justify="space-between" align="center"
        bg={bVenceu ? 'rgba(217,119,6,0.1)' : 'transparent'}
      >
        <VStack align="flex-start" spacing={0}>
          <Text
            fontWeight={bVenceu ? 700 : 500}
            opacity={aVenceu ? 0.4 : 1}
            fontSize="sm" noOfLines={1}
          >
            {isBye ? 'BYE (Avanço automático)' : (pB?.nomeAmigo ?? '?')}
          </Text>
          <Text fontSize="2xs" opacity={0.6}>{pB?.timeSorteado ?? '—'}</Text>
        </VStack>
        <Text
          fontWeight={800} fontSize="lg"
          opacity={aVenceu ? 0.4 : 1}
        >
          {isBye ? '—' : (partida.placarB ?? '—')}
        </Text>
      </Flex>

      {/* Pênaltis */}
      {partida.penaltisA !== null && partida.penaltisB !== null && (
        <Flex bg="brand.dark" px={3} py={1} justify="center" align="center" gap={2}>
          <Text fontSize="xs" color="brand.light" fontWeight={700}>
            Pênaltis: {partida.penaltisA} × {partida.penaltisB}
          </Text>
        </Flex>
      )}
    </Box>
  );
}

// ─── Bloco de confronto (ida + volta) ─────────────────────────────────────────
function BlocoConfronto({
  confrontoId,
  partidas,
  onAbrir,
}: {
  confrontoId: string;
  partidas: Partida[];
  onAbrir: (partida: Partida) => void;
}) {
  const { participantes } = useTorneioStore();
  const jogos = partidas.filter((p) => p.confrontoId === confrontoId)
    .sort((a) => (a.jogo === 'ida' ? -1 : 1));

  if (jogos.length === 0) return null;

  const ida   = jogos.find((j) => j.jogo === 'ida');
  const volta = jogos.find((j) => j.jogo === 'volta');
  const vencedorId = volta?.vencedorId ?? ida?.vencedorId;
  const vencedor = participantes.find((p) => p.id === vencedorId);

  // Calcular agregado
  const golsA_total = (ida?.placarA ?? 0) + (volta?.placarB ?? 0);
  const golsB_total = (ida?.placarB ?? 0) + (volta?.placarA ?? 0);
  const idaFinalizada = ida?.finalizada;
  const voltaFinalizada = volta?.finalizada;

  return (
    <Box
      bg="brand.surfaceLight"
      borderRadius="4px"
      borderWidth={1}
      borderColor={vencedorId ? 'brand.orange' : 'brand.dark'}
      _dark={{ bg: 'brand.surfaceDark', borderColor: vencedorId ? 'brand.orange' : 'whiteAlpha.300' }}
      overflow="hidden"
      minW={{ base: '100%', md: '200px' }}
      maxW={{ base: '100%', md: '220px' }}
    >
      {/* Header do confronto */}
      <Flex bg="blackAlpha.100" _dark={{ bg: 'whiteAlpha.50', borderColor: 'whiteAlpha.300' }} px={3} py={2} justify="space-between" align="center" borderBottomWidth={1} borderColor="brand.dark">
        <Text fontSize="2xs" opacity={0.6} fontWeight={700} textTransform="uppercase">
          Confronto
        </Text>
        {idaFinalizada && voltaFinalizada && (
          <Text fontSize="2xs" opacity={0.6}>
            Agr: {golsA_total} × {golsB_total}
          </Text>
        )}
      </Flex>

      <VStack spacing={0} p={2}>
        {jogos.map((jogo) => (
          <CardPartida key={jogo.id} partida={jogo} onAbrir={onAbrir} />
        ))}
      </VStack>

      {/* Vencedor do confronto */}
      {vencedor && (
        <Flex bg="brand.orange" px={3} py={2} align="center" gap={2} borderTopWidth={1} borderColor="brand.dark">
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="xs" color="brand.dark" fontWeight={700} textTransform="uppercase" letterSpacing="wide">
              {vencedor.nomeAmigo} avança
            </Text>
            <Text fontSize="2xs" color="brand.dark" opacity={0.8}>{vencedor.timeSorteado}</Text>
          </VStack>
        </Flex>
      )}
    </Box>
  );
}

// ─── Bloco de jogo unico (sem confrontoId) ─────────────────────────────────────
function BlocoJogoUnico({ partida, onAbrir }: { partida: Partida; onAbrir: (p: Partida) => void }) {
  const { participantes } = useTorneioStore();
  const vencedor = participantes.find((p) => p.id === partida.vencedorId);

  return (
    <Box
      bg="brand.surfaceLight"
      borderRadius="4px" borderWidth={1}
      borderColor={partida.vencedorId ? 'brand.orange' : 'brand.dark'}
      _dark={{ bg: 'brand.surfaceDark', borderColor: partida.vencedorId ? 'brand.orange' : 'whiteAlpha.300' }}
      overflow="hidden"
      minW={{ base: '100%', md: '200px' }}
      maxW={{ base: '100%', md: '220px' }}
    >
      <CardPartida partida={partida} onAbrir={onAbrir} />
      {vencedor && (
        <Flex bg="brand.orange" px={3} py={2} align="center" gap={2} borderTopWidth={1} borderColor="brand.dark">
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="xs" color="brand.dark" fontWeight={700} textTransform="uppercase" letterSpacing="wide">
              {vencedor.nomeAmigo} avança
            </Text>
            <Text fontSize="2xs" color="brand.dark" opacity={0.8}>{vencedor.timeSorteado}</Text>
          </VStack>
        </Flex>
      )}
    </Box>
  );
}

// ─── Chaveamento principal ────────────────────────────────────────────────
function BlocoJogo3oLugar({ partida, onAbrir }: { partida: Partida; onAbrir: (p: Partida) => void }) {
  const { participantes } = useTorneioStore();
  const pA = participantes.find((p) => p.id === partida.participanteAId);
  const pB = participantes.find((p) => p.id === partida.participanteBId);
  const vencedor = participantes.find((p) => p.id === partida.vencedorId);

  return (
    <Box
      borderWidth={1} borderColor="brand.dark" borderRadius="4px"
      _dark={{ borderColor: 'whiteAlpha.300' }}
      overflow="hidden"
      maxW="280px"
    >
      <Flex
        bg="blackAlpha.100"
        px={3} py={2} borderBottomWidth={1} borderColor="brand.dark"
        _dark={{ bg: 'whiteAlpha.50', borderColor: 'whiteAlpha.300' }}
        align="center" justify="space-between"
      >
        <Text fontSize="2xs" opacity={0.6} fontWeight={700} textTransform="uppercase">Disputa de 3º Lugar</Text>
        {partida.finalizada
          ? <Badge variant="outline" borderRadius="2px" fontSize="2xs">Finalizado</Badge>
          : <Badge variant="solid" bg="brand.orange" color="brand.dark" borderRadius="2px" fontSize="2xs">Lançar Placar</Badge>
        }
      </Flex>
      <Flex px={3} py={2} justify="space-between" align="center"
        bg={partida.vencedorId === partida.participanteAId ? 'rgba(217,119,6,0.07)' : 'transparent'}
      >
        <VStack align="flex-start" spacing={0}>
          <Text fontWeight={700} fontSize="sm">{pA?.nomeAmigo ?? '?'}</Text>
          <Text fontSize="2xs" opacity={0.6}>{pA?.timeSorteado ?? '—'}</Text>
        </VStack>
        <Text fontWeight={800} fontSize="lg">{partida.placarA ?? '—'}</Text>
      </Flex>
      <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} />
      <Flex px={3} py={2} justify="space-between" align="center"
        bg={partida.vencedorId === partida.participanteBId ? 'rgba(217,119,6,0.07)' : 'transparent'}
      >
        <VStack align="flex-start" spacing={0}>
          <Text fontWeight={700} fontSize="sm">{pB?.nomeAmigo ?? '?'}</Text>
          <Text fontSize="2xs" opacity={0.6}>{pB?.timeSorteado ?? '—'}</Text>
        </VStack>
        <Text fontWeight={800} fontSize="lg">{partida.placarB ?? '—'}</Text>
      </Flex>
      {vencedor && (
        <Flex
          bg="blackAlpha.200" _dark={{ bg: 'whiteAlpha.100', borderColor: 'whiteAlpha.300' }}
          px={3} py={2} borderTopWidth={1} borderColor="brand.dark"
        >
          <Text fontSize="xs" fontWeight={700}>{vencedor.nomeAmigo} — 3º Lugar</Text>
        </Flex>
      )}
      {!partida.finalizada && (
        <Box px={3} pb={3} pt={1}>
          <Badge
            cursor="pointer" variant="solid" bg="brand.dark" color="brand.light"
            _dark={{ bg: 'brand.light', color: 'brand.dark' }}
            borderRadius="2px" w="full" textAlign="center" py={1}
            onClick={() => !partida.finalizada && onAbrir(partida)}
          >
            Registrar Placar
          </Badge>
        </Box>
      )}
    </Box>
  );
}

export function Chaveamento() {
  const { partidas } = useTorneioStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [partidaSelecionada, setPartidaSelecionada] = useState<Partida | null>(null);

  const abrirModal = (partida: Partida) => {
    setPartidaSelecionada(partida);
    onOpen();
  };

  // Agrupa partidas do bracket (excluindo terceiro_lugar)
  const fasesPresentesSet = new Set(partidas.map((p) => p.fase).filter(Boolean));
  const fasesPresentes = ORDEM_FASES.filter((f) => fasesPresentesSet.has(f));

  // Partidas de terceiro_lugar
  const partidasTerceiroLugar = partidas.filter((p) => p.fase === 'terceiro_lugar');

  function confrontosDaFase(fase: FaseMataMata) {
    const confrontosSet = new Set<string>();
    partidas.filter((p) => p.fase === fase && p.confrontoId).forEach((p) => {
      confrontosSet.add(p.confrontoId!);
    });
    return Array.from(confrontosSet);
  }

  // Partidas de jogo unico (sem confrontoId) por fase
  function jogoUnicoDaFase(fase: FaseMataMata): Partida[] {
    return partidas.filter((p) => p.fase === fase && p.jogo === null && !p.confrontoId);
  }

  if (fasesPresentes.length === 0 && partidasTerceiroLugar.length === 0) {
    return (
      <Flex h="200px" align="center" justify="center">
        <Text color="whiteAlpha.400">Nenhuma chave gerada.</Text>
      </Flex>
    );
  }

  return (
    <>
      {/* Bracket — rolagem horizontal no mobile */}
      <Box overflowX="auto" pb={4}>
        <HStack
          spacing={0}
          align="flex-start"
          minW={{ base: 'max-content', lg: 'auto' }}
        >
          {fasesPresentes.map((fase, faseIdx) => (
            <HStack key={fase} spacing={0} align="stretch">
              {/* Coluna da fase */}
              <VStack
                spacing={4}
                align="stretch"
                px={3}
                minW={{ base: '240px', md: '260px' }}
              >
                {/* Label da fase */}
                <Box textAlign="center" py={2}>
                  <Badge
                    colorScheme="orange"
                    variant="outline"
                    borderRadius="2px"
                    px={4}
                    py={1}
                    fontSize="xs"
                    fontWeight={700}
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    {FASES_LABEL[fase]}
                  </Badge>
                </Box>

                {/* Confrontos (ida+volta) */}
                <VStack spacing={4} align="stretch" justify="space-around" flex={1}>
                  {confrontosDaFase(fase).map((cId) => (
                    <BlocoConfronto
                      key={cId} confrontoId={cId} partidas={partidas} onAbrir={abrirModal}
                    />
                  ))}
                  {/* Jogos unicos da mesma fase */}
                  {jogoUnicoDaFase(fase).map((p) => (
                    <BlocoJogoUnico key={p.id} partida={p} onAbrir={abrirModal} />
                  ))}
                </VStack>
              </VStack>

              {/* Conector visual entre fases */}
              {faseIdx < fasesPresentes.length - 1 && (
                <Flex align="center" justify="center" px={1}>
                  <Box
                    w="24px" h="1px"
                    bg="brand.dark"
                    _dark={{ bg: 'whiteAlpha.300' }}
                    position="relative"
                  >
                    <Box
                      position="absolute" right={-1} top="50%"
                      transform="translateY(-50%)"
                      w={0} h={0}
                      borderTop="4px solid transparent"
                      borderBottom="4px solid transparent"
                      borderLeft="6px solid"
                      borderLeftColor="brand.dark"
                      _dark={{ borderLeftColor: 'whiteAlpha.300' }}
                    />
                  </Box>
                  <Text fontFamily="heading" fontSize="xs" mx={1} opacity={0.5}>VS</Text>
                  <Box
                    w="24px" h="1px"
                    bg="brand.dark"
                    _dark={{ bg: 'whiteAlpha.300' }}
                  />
                </Flex>
              )}
            </HStack>
          ))}
        </HStack>
      </Box>

      {/* Caixa isolada: Disputa de 3o Lugar */}
      {partidasTerceiroLugar.length > 0 && (
        <Box mt={6}>
          <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} mb={5} />
          <Text
            fontSize="xs" fontWeight={700} textTransform="uppercase"
            letterSpacing="wide" opacity={0.5} mb={3}
          >
            Consolacao
          </Text>
          <HStack spacing={4} flexWrap="wrap">
            {partidasTerceiroLugar.map((p) => (
              <BlocoJogo3oLugar key={p.id} partida={p} onAbrir={abrirModal} />
            ))}
          </HStack>
        </Box>
      )}

      {/* Modal de placar */}
      {partidaSelecionada && (
        <ModalPlacar
          isOpen={isOpen}
          onClose={onClose}
          partida={partidaSelecionada}
          modo="matamata"
        />
      )}
    </>
  );
}
