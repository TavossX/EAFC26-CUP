import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Spinner,
  Text,
  VStack,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTorneioStore } from '../store/torneioStore';
import CanecaChopp from '../assets/logos/CanecaChopp.png';
import { TabelaClassificacao } from '../components/TabelaClassificacao';
import { Chaveamento } from '../components/Chaveamento';

// ─── Ícones SVG ───────────────────────────────────────────────────────────────
const RefreshIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ─── Página ───────────────────────────────────────────────────────────────────
export function Convite() {
  const { campeonatoId } = useParams<{ campeonatoId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { torneio, participantes, carregarTorneioPublico } = useTorneioStore();
  const partidas = useTorneioStore((s) => s.partidas);

  const [status, setStatus] = useState<'carregando' | 'ok' | 'erro'>('carregando');
  const [atualizando, setAtualizando] = useState(false);

  // Progresso calculado reativamente (antes dos returns condicionais)
  const totalFinalizados = partidas.filter((p) => p.finalizada).length;
  const totalPartidas    = partidas.length;
  const progresso        = totalPartidas > 0 ? Math.round((totalFinalizados / totalPartidas) * 100) : 0;

  // Carrega o torneio pelo ID da URL
  const carregar = async (showToast = false) => {
    if (!campeonatoId) { setStatus('erro'); return; }
    if (showToast) setAtualizando(true);
    else setStatus('carregando');

    const ok = await carregarTorneioPublico(campeonatoId);

    if (showToast) {
      setAtualizando(false);
      toast({
        title: ok ? '✅ Dados atualizados!' : '⛔ Erro ao atualizar',
        status: ok ? 'success' : 'error',
        duration: 2000,
        position: 'top',
        isClosable: true,
      });
    } else {
      setStatus(ok ? 'ok' : 'erro');
    }
  };

  useEffect(() => {
    carregar();
    // Limpeza: reseta a store quando sair da página de convite
    // para não contaminar uma sessão de organizador
    return () => { /* não reseta aqui para não atrapalhar refresh */ };
  }, [campeonatoId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === 'carregando') {
    return (
      <Flex minH="100vh" bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }} align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color="brand.orange" thickness="3px" speed="0.8s" />
        <Text opacity={0.6} fontSize="sm">Carregando torneio…</Text>
      </Flex>
    );
  }

  // ── Erro ───────────────────────────────────────────────────────────────────
  if (status === 'erro' || !torneio) {
    return (
      <Flex minH="100vh" bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }} align="center" justify="center" px={4}>
        <Box
          maxW="400px" w="full" bg="blackAlpha.50" borderRadius="2px"
          borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'whiteAlpha.50', borderColor: 'whiteAlpha.300' }} p={8} textAlign="center"
        >
          <Heading size="md" fontFamily="heading" mb={2}>Torneio não encontrado</Heading>
          <Text fontSize="sm" opacity={0.6} mb={6} lineHeight="1.6">
            Este link pode estar incorreto ou o torneio ainda não foi publicado pelo organizador.
          </Text>
          <VStack spacing={3}>
            <Button w="full" onClick={() => carregar()} variant="solid" bg="brand.orange" color="brand.dark" borderRadius="2px">
              Tentar novamente
            </Button>
            <Button w="full" variant="solid" color="brand.dark" _dark={{ color: 'white' }} borderRadius="2px"
              onClick={() => navigate('/torneio/configurar')}>
              Criar meu próprio torneio
            </Button>
          </VStack>
        </Box>
      </Flex>
    );
  }

  // ── Torneio carregado ─────────────────────────────────────────────────────

  return (
    <Box minH="100vh" bg="brand.surfaceLight" _dark={{ bg: 'brand.surfaceDark' }}>
      {/* Header somente leitura */}
      <Box
        bg="brand.surfaceLight"
        borderBottomWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}
        position="sticky" top={0} zIndex={100}
      >
        <Flex
          maxW="1000px" mx="auto" px={{ base: 4, md: 8 }} py={3}
          align="center" justify="space-between" gap={3}
        >
          <HStack spacing={3}>
            <Image src={CanecaChopp} alt="Bar do Bira" h="32px" />
            <VStack spacing={0} align="flex-start">
              <Heading size="sm" fontFamily="heading" lineHeight="1.1">{torneio.nome}</Heading>
              <HStack spacing={2}>
                <Badge
                  colorScheme="orange" variant="outline"
                  fontSize="2xs" borderRadius="2px"
                >
                  {torneio.formato === 'liga' ? 'Liga' : 'Mata-mata'}
                </Badge>
                <Badge variant="outline" fontSize="2xs" borderRadius="2px">
                  Somente leitura
                </Badge>
              </HStack>
            </VStack>
          </HStack>

          <HStack spacing={3}>
            <Button
              size="sm" variant="solid"
              onClick={() => navigate('/')}
              borderRadius="2px"
              borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}
            >
              Dashboard
            </Button>
            <Button
              id="btn-atualizar"
              leftIcon={<RefreshIcon /> as any}
            size="sm"
            variant="ghost"
            color="whiteAlpha.600"
            _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
            isLoading={atualizando}
            loadingText="Atualizando…"
            onClick={() => carregar(true)}
          >
            Atualizar
          </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Conteúdo */}
      <Box maxW="1000px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} position="relative">
        {/* Barra de progresso */}
        <Box mb={6}>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xs" opacity={0.6} fontWeight={600}>
              Progresso do torneio
            </Text>
            <Text fontSize="xs" fontWeight={700}>
              {totalFinalizados}/{totalPartidas} jogos ({progresso}%)
            </Text>
          </HStack>
          <Box w="full" h="6px" bg="blackAlpha.100" _dark={{ bg: 'whiteAlpha.100' }} borderRadius="2px" overflow="hidden">
            <Box
              h="full"
              w={`${progresso}%`}
              bg="brand.orange"
              transition="width 0.6s ease"
            />
          </Box>
        </Box>

        {/* Participantes */}
        <Box
          mb={6} bg="blackAlpha.50" borderRadius="2px"
          borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'whiteAlpha.50', borderColor: 'whiteAlpha.300' }} p={4}
        >
          <Text fontSize="xs" opacity={0.6} fontWeight={700}
            textTransform="uppercase" letterSpacing="wide" mb={3}>
            {participantes.length} participantes
          </Text>
          <Flex flexWrap="wrap" gap={2}>
            {participantes.map((p) => (
              <HStack
                key={p.id}
                bg="brand.surfaceLight" borderRadius="2px" px={3} py={1}
                spacing={2} borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}
              >
                <Text fontSize="xs" fontWeight={600}>{p.nomeAmigo}</Text>
                <Badge variant="outline" fontSize="2xs" borderRadius="2px">
                  {p.timeSorteado}
                </Badge>
              </HStack>
            ))}
          </Flex>
        </Box>

        <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} mb={6} />

        {/* Conteúdo principal: tabela ou chaveamento */}
        {torneio.formato === 'liga' ? (
          <Box>
            <Heading size="md" fontFamily="heading" mb={5}>Classificação</Heading>
            <TabelaClassificacao />
          </Box>
        ) : (
          <Box>
            <Heading size="md" fontFamily="heading" mb={2}>Chaveamento</Heading>
            <Text fontSize="sm" opacity={0.6} mb={5}>
              Acompanhe os confrontos e veja quem avança de fase.
            </Text>
            <Chaveamento />
          </Box>
        )}

        {/* Rodapé */}
        <Box mt={10} pt={6} borderTopWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} textAlign="center">
          <Text fontSize="xs" opacity={0.6}>
            Copa de Amigos — EA FC 26 · Torneio ID:{' '}
            <Text as="span" fontFamily="mono" opacity={0.8}>{torneio.id}</Text>
          </Text>
          <Button
            mt={3} size="sm" variant="solid" color="brand.orange"
            onClick={() => navigate('/torneio/configurar')}
          >
            Criar meu próprio torneio →
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
