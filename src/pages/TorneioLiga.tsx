import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  useDisclosure,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Image,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTorneioStore } from '../store/torneioStore';
import CanecaChopp from '../assets/logos/CanecaChopp.png';
import { supabase } from '../lib/supabase';
import { TabelaClassificacao } from '../components/TabelaClassificacao';
import { ModalPlacar } from '../components/ModalPlacar';
import { ModalCompartilhar } from '../components/ModalCompartilhar';
import { Chaveamento } from '../components/Chaveamento';

const ResetIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
import type { Partida } from '../types/torneio';

export function TorneioLiga() {
  const { torneio, partidas, participantes, resetarTorneio, gerarPlayoffs } = useTorneioStore();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [partidaSelecionada, setPartidaSelecionada] = useState<Partida | null>(null);

  const compartilharDisclosure = useDisclosure();

  if (!torneio) {
    return (
      <Flex minH="100vh" bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }} align="center" justify="center">
        <VStack spacing={4}>
          <Text opacity={0.6}>Nenhum torneio configurado.</Text>
          <Button onClick={() => navigate('/torneio/configurar')} variant="solid" bg="brand.orange" color="brand.dark" borderRadius="2px">
            Criar Torneio
          </Button>
        </VStack>
      </Flex>
    );
  }

  const abrirModal = (partida: Partida) => {
    setPartidaSelecionada(partida);
    onOpen();
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar os dados deste torneio?')) {
      resetarTorneio();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Agrupa partidas por rodada — apenas partidas de liga (fase: null)
  const partidasLiga = partidas.filter((p) => p.fase === null);
  const rodasUnicas = Array.from(new Set(partidasLiga.map((p) => p.rodada))).sort((a, b) => a - b);
  const totalFinalizadas = partidas.filter((p) => p.finalizada).length;

  // Liga + Playoffs: liga completa quando 100% das partidas sem fase estao finalizadas
  const isHibrido   = torneio.formato === 'liga_com_playoffs';
  const ligaCompleta = isHibrido && partidasLiga.length > 0 && partidasLiga.every((p) => p.finalizada);

  return (
    <Box minH="100vh" bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}>
      {/* Header */}
      <Box
        bg="brand.surfaceLight"
        borderBottomWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}
        position="sticky" top={0} zIndex={100}
      >
        <Flex
          maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={3}
          align="center" justify="space-between" gap={3}
        >
          <HStack spacing={3}>
            <Image src={CanecaChopp} alt="Bar do Bira" h="32px" />
            <VStack spacing={0} align="flex-start">
              <Heading size="sm" fontFamily="heading">{torneio.nome}</Heading>
              <Text fontSize="xs" opacity={0.6}>
                {torneio.formato === 'liga_com_playoffs'
                  ? `Liga + Playoffs — ${torneio.idaEVolta ? 'Ida e Volta' : 'Jogo Único'}`
                  : `Pontos Corridos — ${torneio.idaEVolta ? 'Ida e Volta' : 'Jogo Único'}`
                }
              </Text>
            </VStack>
          </HStack>
          <HStack spacing={3}>
            <Badge variant="outline" colorScheme="orange" borderRadius="2px" px={3} display={{ base: 'none', sm: 'flex' }}>
              {totalFinalizadas}/{partidas.length} jogos
            </Badge>
            <Button
              id="btn-compartilhar-liga"
              size="sm"
              variant="solid"
              bg="blue.500"
              color="white"
              _hover={{ bg: 'blue.600' }}
              fontWeight={600}
              borderRadius="5px"
              onClick={compartilharDisclosure.onOpen}
              display={{ base: 'none', sm: 'flex' }}
            >
              Compartilhar
            </Button>
            <Button
              leftIcon={<ResetIcon /> as any}
              size="sm" variant="solid"
              onClick={handleReset}
              borderRadius="5px"
              bg="gray.500" color="white"
              _hover={{ bg: 'gray.600' }}
            >
              Resetar
            </Button>
            <Button
              size="sm" variant="solid"
              onClick={() => navigate('/')}
              borderRadius="2px"
              borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}
            >
              Dashboard
            </Button>
            <Button
              size="sm" variant="solid"
              onClick={handleLogout}
              borderRadius="5px"
              bg="red.600" color="white"
              _hover={{ bg: 'red.700' }}
              leftIcon={<LogoutIcon /> as any}
            >
              Sair
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }}>
        <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={8}>
          {/* Tabela de classificação */}
          <Box>
            <HStack mb={4} spacing={3}>
              <Heading size="md" fontFamily="heading">Classificação</Heading>
              <Badge variant="outline" borderRadius="2px" px={3}>
                {participantes.length} participantes
              </Badge>
            </HStack>
            <TabelaClassificacao highlightTop4={isHibrido} />
          </Box>

          {/* Banner Iniciar Playoffs (liga_com_playoffs apenas) */}
          {isHibrido && ligaCompleta && !torneio.playoffsGerados && (
            <Box
              borderWidth={2} borderColor="brand.orange" borderRadius="4px"
              p={6} textAlign="center"
              bg="rgba(217,119,6,0.05)"
            >
              <VStack spacing={3}>
                <Badge colorScheme="orange" variant="outline" borderRadius="2px" px={3} fontSize="xs">
                  FASE DE LIGA ENCERRADA
                </Badge>
                <Heading size="md" fontFamily="heading">Playoffs — Top 4</Heading>
                <Text fontSize="sm" opacity={0.65}>
                  1º × 4º &nbsp;&bull;&nbsp; 2º × 3º
                </Text>
                <Button
                  id="btn-iniciar-playoffs"
                  mt={2}
                  size="lg"
                  bg="brand.orange"
                  color="brand.dark"
                  borderRadius="2px"
                  fontWeight={800}
                  onClick={gerarPlayoffs}
                  _hover={{ opacity: 0.9 }}
                >
                  Iniciar Playoffs
                </Button>
              </VStack>
            </Box>
          )}

          {/* Chaveamento de playoffs */}
          {isHibrido && torneio.playoffsGerados && (
            <Box>
              <Heading size="md" fontFamily="heading" mb={4}>Playoffs</Heading>
              <Chaveamento />
            </Box>
          )}

          <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} />

          {/* Rodadas / Jogos -- apenas partidas de liga */}
          <Box>
            <Heading size="md" fontFamily="heading" mb={4}>Rodadas</Heading>

            <Accordion allowMultiple defaultIndex={[0]}>
              {rodasUnicas.map((rodada) => {
                const jogosRodada = partidasLiga.filter((p) => p.rodada === rodada);
                const finalizadosRodada = jogosRodada.filter((p) => p.finalizada).length;
                const rodadaCompleta = finalizadosRodada === jogosRodada.length;
                const isVolta = rodada > rodasUnicas.length / 2;

                return (
                  <AccordionItem
                    key={rodada}
                    border="1px solid"
                    borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}
                    borderRadius="2px"
                    mb={3}
                    overflow="hidden"
                  >
                    <AccordionButton
                      bg="blackAlpha.50" _dark={{ bg: 'whiteAlpha.50' }}
                      _hover={{ bg: 'blackAlpha.100', _dark: { bg: 'whiteAlpha.100' } }}
                      py={3} px={4}
                      _expanded={{ borderBottom: '1px solid', borderColor: 'brand.dark', _dark: { borderColor: 'whiteAlpha.300' } }}
                    >
                      <HStack flex={1} spacing={3}>
                        <Text fontWeight={700} fontSize="sm">
                          Rodada {rodada}
                        </Text>
                        <Badge
                          variant="outline" fontSize="2xs" borderRadius="2px"
                        >
                          {torneio.idaEVolta ? (isVolta ? 'Volta' : 'Ida') : `Rodada ${rodada}`}
                        </Badge>
                        <Badge
                          colorScheme={rodadaCompleta ? 'gray' : 'orange'}
                          variant="outline" fontSize="2xs" borderRadius="2px"
                        >
                          {finalizadosRodada}/{jogosRodada.length}
                        </Badge>
                      </HStack>
                      <AccordionIcon opacity={0.6} />
                    </AccordionButton>

                    <AccordionPanel bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }} p={4}>
                      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
                        {jogosRodada.map((jogo) => {
                          const pA = participantes.find((p) => p.id === jogo.participanteAId);
                          const pB = participantes.find((p) => p.id === jogo.participanteBId);
                          const aVenceu = jogo.vencedorId === jogo.participanteAId;
                          const bVenceu = jogo.vencedorId === jogo.participanteBId;

                          return (
                            <Box
                              key={jogo.id}
                              borderRadius="2px"
                              borderWidth={1}
                              borderColor={jogo.finalizada ? 'brand.dark' : 'brand.dark'}
                              bg={jogo.finalizada ? 'blackAlpha.50' : 'brand.surfaceLight'}
                              _dark={{ borderColor: jogo.finalizada ? 'whiteAlpha.300' : 'whiteAlpha.400', bg: jogo.finalizada ? 'whiteAlpha.50' : 'brand.surfaceDark' }}
                              cursor={jogo.finalizada ? 'default' : 'pointer'}
                              onClick={() => !jogo.finalizada && abrirModal(jogo)}
                              transition="all 0.2s"
                              _hover={
                                !jogo.finalizada
                                  ? { borderColor: 'brand.orange' }
                                  : {}
                              }
                              overflow="hidden"
                            >
                              {/* Player A */}
                              <Flex px={3} py={2} justify="space-between" align="center"
                                bg={aVenceu ? 'rgba(217,119,6,0.1)' : 'transparent'}
                              >
                                <VStack align="flex-start" spacing={0} flex={1} overflow="hidden">
                                  <Text fontWeight={aVenceu ? 700 : 500}
                                    opacity={bVenceu ? 0.4 : 1}
                                    fontSize="sm" noOfLines={1}
                                  >
                                    {pA?.nomeAmigo ?? '?'}
                                  </Text>
                                  <Text fontSize="2xs" opacity={0.6} noOfLines={1}>
                                    {pA?.timeSorteado ?? '—'}
                                  </Text>
                                </VStack>
                                <Text fontWeight={800} fontSize="lg"
                                  opacity={bVenceu ? 0.4 : 1}
                                >
                                  {jogo.placarA ?? '—'}
                                </Text>
                              </Flex>

                              <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} />

                              {/* Player B */}
                              <Flex px={3} py={2} justify="space-between" align="center"
                                bg={bVenceu ? 'rgba(217,119,6,0.1)' : 'transparent'}
                              >
                                <VStack align="flex-start" spacing={0} flex={1} overflow="hidden">
                                  <Text fontWeight={bVenceu ? 700 : 500}
                                    opacity={aVenceu ? 0.4 : 1}
                                    fontSize="sm" noOfLines={1}
                                  >
                                    {pB?.nomeAmigo ?? '?'}
                                  </Text>
                                  <Text fontSize="2xs" opacity={0.6} noOfLines={1}>
                                    {pB?.timeSorteado ?? '—'}
                                  </Text>
                                </VStack>
                                <Text fontWeight={800} fontSize="lg"
                                  opacity={aVenceu ? 0.4 : 1}
                                >
                                  {jogo.placarB ?? '—'}
                                </Text>
                              </Flex>

                              {!jogo.finalizada && (
                                <Flex bg="blackAlpha.100" _dark={{ bg: 'whiteAlpha.100' }} px={3} py={1} justify="center">
                                  <Text fontSize="2xs" opacity={0.8} fontWeight={600} textTransform="uppercase">
                                    Lançar placar
                                  </Text>
                                </Flex>
                              )}
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Modal placar */}
      {partidaSelecionada && (
        <ModalPlacar
          isOpen={isOpen}
          onClose={onClose}
          partida={partidaSelecionada}
          modo="liga"
        />
      )}

      {/* Modal compartilhar */}
      <ModalCompartilhar
        isOpen={compartilharDisclosure.isOpen}
        onClose={compartilharDisclosure.onClose}
      />
    </Box>
  );
}
