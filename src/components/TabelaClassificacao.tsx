import {
  Box,
  Flex,
  HStack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import { useTorneioStore } from '../store/torneioStore';
import type { Participante } from '../types/torneio';

// ─── Ordenação ────────────────────────────────────────────────────────────────
function ordenarParticipantes(
  lista: Participante[],
  partidas: ReturnType<typeof useTorneioStore.getState>['partidas']
): Participante[] {
  return [...lista].sort((a, b) => {
    // 1. Pontos
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;

    // 2. Saldo de Gols
    const sgA = a.golsPro - a.golsContra;
    const sgB = b.golsPro - b.golsContra;
    if (sgB !== sgA) return sgB - sgA;

    // 3. Gols Pró
    if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;

    // 4. Confronto Direto
    const confrontos = partidas.filter(
      (p) => p.finalizada &&
        ((p.participanteAId === a.id && p.participanteBId === b.id) ||
         (p.participanteAId === b.id && p.participanteBId === a.id))
    );
    let pontosA = 0, pontosB = 0;
    confrontos.forEach((p) => {
      const aJogouComoA = p.participanteAId === a.id;
      const ga = aJogouComoA ? (p.placarA ?? 0) : (p.placarB ?? 0);
      const gb = aJogouComoA ? (p.placarB ?? 0) : (p.placarA ?? 0);
      if (ga > gb) pontosA += 3;
      else if (ga < gb) pontosB += 3;
      else { pontosA += 1; pontosB += 1; }
    });
    return pontosB - pontosA;
  });
}

// ─── Posição visual ───────────────────────────────────────────────────────────
function getBorderLeftColor(pos: number, total: number): string {
  if (pos === 1) return 'brand.orange';
  if (pos > total - 2 && total > 3) return 'red.800'; // Ferrugem escura/Vinho
  return 'transparent';
}

function getBgPosicao(pos: number, total: number): string {
  if (pos === 1) return 'rgba(217,119,6,0.1)'; // brand.orange com opacidade
  if (pos > total - 2 && total > 3) return 'rgba(153,27,27,0.1)'; // red.800 com opacidade
  return 'transparent';
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function TabelaClassificacao() {
  const { participantes, partidas } = useTorneioStore();

  const classificacao = useMemo(
    () => ordenarParticipantes(participantes, partidas),
    [participantes, partidas]
  );

  const totalJogos = partidas.filter((p) => p.finalizada).length;
  const totalPartidas = partidas.length;

  if (classificacao.length === 0) {
    return (
      <Flex h="200px" align="center" justify="center">
        <Text color="whiteAlpha.400">Nenhum participante cadastrado.</Text>
      </Flex>
    );
  }

  return (
    <Box>
      {/* Progresso do torneio */}
      <HStack mb={4} justify="space-between">
        <Text fontSize="sm" opacity={0.7}>
          Progresso:{' '}
          <Text as="span" fontWeight={700}>
            {totalJogos}/{totalPartidas}
          </Text>{' '}
          partidas realizadas
        </Text>
        <Badge
          colorScheme={totalJogos === totalPartidas ? 'gray' : 'orange'}
          variant="outline" borderRadius="2px" px={3}
        >
          {totalJogos === totalPartidas ? 'Finalizado' : 'Em andamento'}
        </Badge>
      </HStack>

      <Box
        overflowX="auto"
        borderRadius="4px"
        borderWidth={1}
        borderColor="brand.dark"
        bg={"brand.surfaceLight"}
        _dark={{ borderColor: 'whiteAlpha.300', bg: 'brand.surfaceDark' }}
      >
        <Table variant="unstyled" size="sm">
          <Thead>
            <Tr borderBottom="1px solid" borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}>
              {['#', 'Participante', 'Time', 'P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG'].map((col) => (
                <Th
                  key={col}
                  fontSize="xs"
                  fontWeight={700}
                  textTransform="uppercase"
                  letterSpacing="wider"
                  opacity={0.7}
                  py={3}
                  px={col === '#' || col === 'P' ? 4 : 3}
                  textAlign={col === 'Participante' || col === 'Time' ? 'left' : 'center'}
                >
                  <Tooltip
                    label={
                      col === 'P' ? 'Pontos' : col === 'J' ? 'Jogos' :
                      col === 'V' ? 'Vitórias' : col === 'E' ? 'Empates' :
                      col === 'D' ? 'Derrotas' : col === 'GP' ? 'Gols Pró' :
                      col === 'GC' ? 'Gols Contra' : col === 'SG' ? 'Saldo de Gols' : col
                    }
                    placement="top"
                    hasArrow
                  >
                    <span style={{ cursor: 'default' }}>{col}</span>
                  </Tooltip>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {classificacao.map((p, idx) => {
              const pos = idx + 1;
              const sg = p.golsPro - p.golsContra;
              const borderColorLine = getBorderLeftColor(pos, classificacao.length);
              return (
                <Tr
                  key={p.id}
                  bg={getBgPosicao(pos, classificacao.length)}
                  borderBottom="1px solid"
                  borderColor="blackAlpha.200"
                  _dark={{ borderColor: 'whiteAlpha.100' }}
                  position="relative"
                  transition="background 0.15s"
                  _hover={{ bg: 'blackAlpha.50', _dark: { bg: 'whiteAlpha.50' } }}
                >
                  {/* Borda Esquerda de Posição (Simulada) */}
                  <Td p={0} w={0} m={0} border={0}>
                    <Box
                      position="absolute"
                      left={0}
                      top={0}
                      bottom={0}
                      w="4px"
                      bg={borderColorLine}
                    />
                  </Td>

                  {/* Posição */}
                  <Td px={4} py={3} textAlign="center" w="44px">
                    <Text fontWeight={800} fontSize="sm">
                      {pos}º
                    </Text>
                  </Td>

                  {/* Nome */}
                  <Td py={3} px={3}>
                    <Text fontWeight={700} fontSize="sm" noOfLines={1}>
                      {p.nomeAmigo}
                    </Text>
                  </Td>

                  {/* Time */}
                  <Td py={3} px={3}>
                    <Badge
                      variant="outline"
                      borderRadius="2px"
                      px={2}
                      fontSize="xs"
                      noOfLines={1}
                    >
                      {p.timeSorteado}
                    </Badge>
                  </Td>

                  {/* Pontos (destaque) */}
                  <Td py={3} px={4} textAlign="center">
                    <Text fontWeight={800} fontSize="md">
                      {p.pontos}
                    </Text>
                  </Td>

                  {/* J V E D */}
                  {[p.jogos, p.vitorias, p.empates, p.derrotas].map((val, i) => (
                    <Td key={i} py={3} px={3} textAlign="center">
                      <Text fontSize="sm" opacity={0.9}>{val}</Text>
                    </Td>
                  ))}

                  {/* GP */}
                  <Td py={3} px={3} textAlign="center">
                    <Text fontSize="sm">{p.golsPro}</Text>
                  </Td>

                  {/* GC */}
                  <Td py={3} px={3} textAlign="center">
                    <Text fontSize="sm">{p.golsContra}</Text>
                  </Td>

                  {/* SG */}
                  <Td py={3} px={3} textAlign="center">
                    <Text fontSize="sm" fontWeight={700}>
                      {sg > 0 ? `+${sg}` : sg}
                    </Text>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      {/* Legenda */}
      <HStack spacing={4} mt={3} flexWrap="wrap">
        <HStack spacing={1}>
          <Box w={2} h={4} bg="brand.orange" />
          <Text fontSize="xs" opacity={0.7}>Campeão / Promoção</Text>
        </HStack>
        <HStack spacing={1}>
          <Box w={2} h={4} bg="red.800" />
          <Text fontSize="xs" opacity={0.7}>Zona de Rebaixamento</Text>
        </HStack>
        <Text fontSize="xs" opacity={0.6}>
          Critérios: Pontos → Saldo → GP → Confronto Direto
        </Text>
      </HStack>
    </Box>
  );
}
