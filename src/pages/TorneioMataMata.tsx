import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTorneioStore } from '../store/torneioStore';
import { Chaveamento } from '../components/Chaveamento';
import { ModalCompartilhar } from '../components/ModalCompartilhar';
import CanecaChopp from '../assets/logos/CanecaChopp.png';
import { supabase } from '../lib/supabase';

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

export function TorneioMataMata() {
  const { torneio, partidas, participantes, resetarTorneio } = useTorneioStore();
  const navigate = useNavigate();
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

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar os dados deste torneio?')) {
      resetarTorneio();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Campeão: vencedor do confronto da final
  const confrontoFinal = (() => {
    const voltaFinal = partidas.find((p) => p.fase === 'final' && p.jogo === 'volta' && p.finalizada && p.vencedorId);
    return voltaFinal ?? null;
  })();
  const campeao = confrontoFinal
    ? participantes.find((p) => p.id === confrontoFinal.vencedorId)
    : null;

  const totalFinalizados = partidas.filter((p) => p.finalizada).length;

  return (
    <Box minH="100vh" bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}>
      {/* Header */}
      <Box
        bg="brand.surfaceLight"
        borderBottomWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}
        position="sticky" top={0} zIndex={100}
      >
        <Flex
          maxW="1400px" mx="auto" px={{ base: 4, md: 8 }} py={3}
          align="center" justify="space-between" gap={3}
        >
          <HStack spacing={3}>
            <Image src={CanecaChopp} alt="Bar do Bira" h="32px" />
            <VStack spacing={0} align="flex-start">
              <Heading size="sm" fontFamily="heading">{torneio.nome}</Heading>
              <Text fontSize="xs" opacity={0.6}>Mata-mata — Ida e Volta</Text>
            </VStack>
          </HStack>
          <HStack spacing={3}>
            <Badge variant="outline" colorScheme="orange" borderRadius="2px" px={3} display={{ base: 'none', sm: 'flex' }}>
              {totalFinalizados}/{partidas.length} jogos
            </Badge>
            <Button
              id="btn-compartilhar-matamata"
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

      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }}>
        {/* Banner de campeão */}
        {campeao && (
          <Box
            mb={8}
            borderRadius="2px"
            bg="brand.orange"
            borderWidth={1}
            borderColor="brand.dark"
            p={6}
            textAlign="center"
          >
            <Heading size="xl" color="brand.dark" fontWeight={800} mb={1} fontFamily="heading" textTransform="uppercase">
              {campeao.nomeAmigo}
            </Heading>
            <Text color="brand.dark" opacity={0.8} fontSize="md">{campeao.timeSorteado}</Text>
            <Badge variant="outline" borderColor="brand.dark" color="brand.dark" borderRadius="2px" mt={3} px={4} fontSize="sm">
              Campeão da Copa de Amigos
            </Badge>
          </Box>
        )}

        {/* Lista de participantes */}
        <Box mb={8}>
          <Heading size="md" fontFamily="heading" mb={4}>Participantes</Heading>
          <Wrap spacing={3}>
            {participantes.map((p) => {
              const isCampeao = p.id === campeao?.id;
              return (
                <WrapItem key={p.id}>
                  <HStack
                    bg={isCampeao ? 'brand.orange' : 'blackAlpha.50'}
                    borderWidth={1}
                    borderColor={isCampeao ? 'brand.dark' : 'brand.dark'}
                    _dark={{ bg: isCampeao ? 'brand.orange' : 'whiteAlpha.50', borderColor: isCampeao ? 'brand.orange' : 'whiteAlpha.300' }}
                    borderRadius="2px"
                    px={4} py={2}
                    spacing={3}
                  >
                    <VStack spacing={0} align="flex-start">
                      <Text fontWeight={700} color={isCampeao ? 'brand.dark' : 'inherit'} fontSize="sm">
                        {p.nomeAmigo}
                      </Text>
                      <Badge
                        variant="outline"
                        colorScheme={isCampeao ? 'blackAlpha' : 'orange'}
                        fontSize="2xs" borderRadius="2px"
                      >
                        {p.timeSorteado}
                      </Badge>
                    </VStack>
                  </HStack>
                </WrapItem>
              );
            })}
          </Wrap>
        </Box>

        {/* Chaveamento */}
        <Box>
          <Heading size="md" fontFamily="heading" mb={4}>Chaveamento</Heading>
          <Text fontSize="sm" opacity={0.6} mb={5}>
            Clique em uma partida para lançar o placar. O vencedor avança automaticamente.
          </Text>
          <Chaveamento />
        </Box>
      </Box>

      {/* Modal compartilhar */}
      <ModalCompartilhar
        isOpen={compartilharDisclosure.isOpen}
        onClose={compartilharDisclosure.onClose}
      />
    </Box>
  );
}
