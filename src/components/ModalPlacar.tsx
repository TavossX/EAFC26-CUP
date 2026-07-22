import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useTorneioStore } from '../store/torneioStore';
import type { Partida } from '../types/torneio';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ModalPlacarProps {
  isOpen: boolean;
  onClose: () => void;
  partida: Partida;
  modo: 'liga' | 'matamata';
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function ModalPlacar({ isOpen, onClose, partida, modo }: ModalPlacarProps) {
  const { participantes, partidas, registrarPlacarLiga, registrarPlacarMataMata } = useTorneioStore();

  const [golsA, setGolsA] = useState(0);
  const [golsB, setGolsB] = useState(0);
  const [penaltisA, setPenaltisA] = useState(0);
  const [penaltisB, setPenaltisB] = useState(0);
  const [loading, setLoading] = useState(false);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setGolsA(0);
      setGolsB(0);
      setPenaltisA(0);
      setPenaltisB(0);
    }
  }, [isOpen, partida.id]);

  const pA = participantes.find((p) => p.id === partida.participanteAId);
  const pB = participantes.find((p) => p.id === partida.participanteBId);

  // ── Lógica de agregado (mata-mata volta) ─────────────────────────────────
  const idaPartida = useMemo(() => {
    if (modo !== 'matamata' || partida.jogo !== 'volta' || !partida.confrontoId) return null;
    return partidas.find(
      (p) => p.confrontoId === partida.confrontoId && p.jogo === 'ida'
    ) ?? null;
  }, [partidas, partida, modo]);

  // Placar agregado PARCIAL (jogo de ida já finalizado)
  const agregadoAtual = useMemo(() => {
    if (!idaPartida?.finalizada) return null;
    // No jogo de ida: participanteA desta partida joga como visitante
    // idaPartida.participanteA = time que joga em CASA na ida (= visitante na volta)
    const golsA_total = (idaPartida.placarB ?? 0) + golsA; // volta: pA joga em casa
    const golsB_total = (idaPartida.placarA ?? 0) + golsB;
    return { golsA_total, golsB_total };
  }, [idaPartida, golsA, golsB]);

  // Mostrar campo de pênaltis?
  const mostrarPenaltis =
    modo === 'matamata' &&
    partida.jogo === 'volta' &&
    idaPartida?.finalizada === true &&
    agregadoAtual !== null &&
    agregadoAtual.golsA_total === agregadoAtual.golsB_total;

  // Botão desabilitado se pênaltis empatados
  const penaltisEmpatados = mostrarPenaltis && penaltisA === penaltisB;
  const podeConfirmar = !penaltisEmpatados;

  // ── Confirmar ─────────────────────────────────────────────────────────────
  const handleConfirmar = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300)); // feedback visual

    if (modo === 'liga') {
      registrarPlacarLiga(partida.id, golsA, golsB);
    } else {
      registrarPlacarMataMata(
        partida.id,
        golsA,
        golsB,
        mostrarPenaltis ? penaltisA : undefined,
        mostrarPenaltis ? penaltisB : undefined
      );
    }

    setLoading(false);
    onClose();
  };

  // ── Renderização ──────────────────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
      <ModalContent
        bg="brand.surfaceLight"
        borderRadius="4px"
        borderWidth={1}
        borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}
        overflow="hidden"
        mx={4}
      >
        {/* Tarja superior */}
        <Box h="4px" bg="brand.orange" />

        <ModalHeader pt={5} pb={2}>
          <HStack spacing={3}>
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="md" fontWeight={700} fontFamily="heading">
                Lançar Placar
              </Text>
              <HStack spacing={2}>
                <Badge
                  variant="outline"
                  colorScheme={modo === 'liga' ? 'orange' : 'orange'}
                  fontSize="2xs"
                  borderRadius="2px"
                  px={2}
                >
                  {modo === 'liga' ? 'Liga' : `Mata-mata — ${partida.jogo === 'ida' ? 'Jogo de Ida' : 'Jogo de Volta'}`}
                </Badge>
                {partida.rodada > 0 && modo === 'liga' && (
                  <Badge variant="outline" fontSize="2xs" borderRadius="2px" px={2}>
                    Rodada {partida.rodada}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        <ModalBody pb={4}>
          <VStack spacing={5}>
            {/* Placar principal */}
            <Flex w="full" align="center" gap={4}>
              {/* Player A */}
              <VStack flex={1} spacing={2}>
                <VStack spacing={0}>
                  <Text fontWeight={700} fontSize="sm" textAlign="center" noOfLines={1}>
                    {pA?.nomeAmigo ?? '?'}
                  </Text>
                  <Text fontSize="xs" opacity={0.6} textAlign="center" noOfLines={1}>
                    {pA?.timeSorteado ?? '—'}
                  </Text>
                </VStack>
                <NumberInput
                  min={0}
                  max={99}
                  value={golsA}
                  onChange={(v) => setGolsA(Number(v))}
                  size="lg"
                >
                  <NumberInputField
                    textAlign="center"
                    
                    fontSize="2xl"
                    fontWeight={800}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </VStack>

              {/* Separador */}
              <Text fontSize="2xl" opacity={0.4} fontWeight={700} mt={6}>×</Text>

              {/* Player B */}
              <VStack flex={1} spacing={2}>
                <VStack spacing={0}>
                  <Text fontWeight={700} fontSize="sm" textAlign="center" noOfLines={1}>
                    {pB?.nomeAmigo ?? '?'}
                  </Text>
                  <Text fontSize="xs" opacity={0.6} textAlign="center" noOfLines={1}>
                    {pB?.timeSorteado ?? '—'}
                  </Text>
                </VStack>
                <NumberInput
                  min={0}
                  max={99}
                  value={golsB}
                  onChange={(v) => setGolsB(Number(v))}
                  size="lg"
                >
                  <NumberInputField
                    textAlign="center"
                    
                    fontSize="2xl"
                    fontWeight={800}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </VStack>
            </Flex>

            {/* Agregado parcial (mata-mata volta) */}
            {agregadoAtual && idaPartida && (
              <>
                <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} />
                <Box
                  w="full"
                  bg="blackAlpha.100"
                  borderRadius="2px"
                  borderWidth={1}
                  borderColor="brand.dark" _dark={{ bg: 'whiteAlpha.50', borderColor: 'whiteAlpha.300' }}
                  p={3}
                >
                  <Text fontSize="xs" opacity={0.6} textAlign="center" mb={2} textTransform="uppercase" letterSpacing="wide">
                    Placar Agregado (em tempo real)
                  </Text>
                  <HStack justify="center" spacing={4}>
                    <VStack spacing={0}>
                      <Text fontSize="xs" opacity={0.6} noOfLines={1}>{pA?.nomeAmigo}</Text>
                      <Text
                        fontSize="2xl" fontWeight={800}
                        color={agregadoAtual.golsA_total > agregadoAtual.golsB_total ? 'brand.orange' : 'inherit'}
                      >
                        {agregadoAtual.golsA_total}
                      </Text>
                    </VStack>
                    <Text opacity={0.4} fontSize="xl">—</Text>
                    <VStack spacing={0}>
                      <Text fontSize="xs" opacity={0.6} noOfLines={1}>{pB?.nomeAmigo}</Text>
                      <Text
                        fontSize="2xl" fontWeight={800}
                        color={agregadoAtual.golsB_total > agregadoAtual.golsA_total ? 'brand.orange' : 'inherit'}
                      >
                        {agregadoAtual.golsB_total}
                      </Text>
                    </VStack>
                  </HStack>
                  {agregadoAtual.golsA_total === agregadoAtual.golsB_total && (
                    <Text fontSize="xs" color="brand.orange" textAlign="center" mt={1} fontWeight={600}>
                      Empate no agregado — pênaltis necessários.
                    </Text>
                  )}
                </Box>
              </>
            )}

            {/* ── Campo de pênaltis (condicional) ─────────────────── */}
            {mostrarPenaltis && (
              <>
                <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} />
                <VStack w="full" spacing={3}>
                  <Alert status="warning" borderRadius="2px" bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }} border="1px solid" borderColor="brand.orange" py={2}>
                    <AlertIcon color="brand.orange" />
                    <AlertDescription fontSize="xs">
                      Disputa de pênaltis. Informe o placar dos pênaltis.
                    </AlertDescription>
                  </Alert>

                  <Flex w="full" align="center" gap={4}>
                    <VStack flex={1} spacing={1}>
                      <Text fontSize="xs" opacity={0.6}>{pA?.nomeAmigo ?? '?'}</Text>
                      <NumberInput min={0} max={30} value={penaltisA} onChange={(v) => setPenaltisA(Number(v))}>
                        <NumberInputField
                          textAlign="center"
                          
                          borderColor="brand.orange"
                          color="brand.orange"
                          fontWeight={800}
                          fontSize="xl"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </VStack>

                    <Text color="brand.orange" fontWeight={700} mt={5}>×</Text>

                    <VStack flex={1} spacing={1}>
                      <Text fontSize="xs" opacity={0.6}>{pB?.nomeAmigo ?? '?'}</Text>
                      <NumberInput min={0} max={30} value={penaltisB} onChange={(v) => setPenaltisB(Number(v))}>
                        <NumberInputField
                          textAlign="center"
                          
                          borderColor="brand.orange"
                          color="brand.orange"
                          fontWeight={800}
                          fontSize="xl"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </VStack>
                  </Flex>

                  {penaltisEmpatados && (
                    <Text fontSize="xs" color="red.400" textAlign="center">
                      ⛔ Pênaltis também empatados — defina um vencedor antes de confirmar.
                    </Text>
                  )}
                </VStack>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter pt={2} pb={5} gap={3}>
          <Button
            variant="solid"
            onClick={onClose}
            flex={1}
          >
            Cancelar
          </Button>
          <Button
            id="btn-confirmar-placar"
            flex={2}
            onClick={handleConfirmar}
            isLoading={loading}
            loadingText="Confirmando..."
            isDisabled={!podeConfirmar}
            variant="solid"
          >
            Confirmar Placar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
