import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoBira from '../assets/logos/Logo.png';
import { supabase } from '../lib/supabase';
import { useTorneioStore } from '../store/torneioStore';

/* ── Ícones SVG ─────────────────────────────────────────────── */
const ChevronDownIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const LinkIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

/* ── Dados mock para os stats ───────────────────────────────── */



/* ── Página ─────────────────────────────────────────────────── */
export function Dashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  
  const [torneios, setTorneios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { carregarTorneioPublico } = useTorneioStore();

  const fetchTorneios = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('torneios_publicos')
        .select('id, nome, formato, status, atualizado_em')
        .eq('user_id', user.id)
        .order('atualizado_em', { ascending: false });
      
      if (!error && data) {
        setTorneios(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTorneios();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleGenerateLink = (id: string) => {
    const url = `${window.location.origin}/convite/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: '🔗 Link copiado!',
      description: url,
      status: 'success',
      duration: 4000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleAcessar = async (torneio: any) => {
    const ok = await carregarTorneioPublico(torneio.id);
    if (ok) {
      if (torneio.formato === 'liga') navigate('/torneio/liga');
      else navigate('/torneio/matamata');
    } else {
      toast({ title: 'Erro ao carregar torneio', status: 'error' });
    }
  };

  const handleExcluir = async (id: string) => {
    const confirm = window.confirm("Tem certeza que deseja excluir este torneio?");
    if (!confirm) return;

    const { error } = await supabase.from('torneios_publicos').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao excluir', status: 'error' });
    } else {
      toast({ title: 'Torneio excluído', status: 'success' });
      setTorneios(torneios.filter(t => t.id !== id));
    }
  };

  return (
    <Box minH="100vh">
      {/* ── Cabeçalho ────────────────────────────────────────── */}
      <Box
        as="header"
        bg="brand.surfaceLight"
        borderBottomWidth={1}
        borderColor="brand.dark"
        _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}
        position="sticky"
        top={0}
        zIndex={100}
      >
        <Flex
          maxW="1200px"
          mx="auto"
          px={{ base: 4, md: 8 }}
          py={3}
          align="center"
          justify="space-between"
          gap={3}
        >
          {/* Logo */}
          <HStack spacing={3}>
            <Image src={LogoBira} alt="Bar do Bira" h="40px" />
          </HStack>

          {/* Ações do header */}
          <HStack spacing={3} flexShrink={0}>
            <Button
              id="btn-novo-torneio"
              size="sm"
              onClick={() => navigate('/torneio/configurar')}
              variant="solid"
              bg="brand.orange"
              color="brand.dark"
              borderRadius="2px"
            >
              Novo Torneio
            </Button>

            <Menu>
              <MenuButton
                as={Button}
                id="btn-user-menu"
                variant="ghost"
                size="sm"
                rightIcon={<ChevronDownIcon /> as any}
                _hover={{ bg: 'whiteAlpha.100' }}
                _active={{ bg: 'whiteAlpha.200' }}
                color="black"
                px={2}
              >
                <HStack spacing={2}>
                  <Avatar size="xs" name="Organizador" bg="brand.500" />
                  <Text display={{ base: 'none', md: 'block' }} fontSize="sm" >
                    Organizador
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList bg="gray.800" borderColor="whiteAlpha.200" shadow="2xl">
                <MenuItem
                  id="btn-logout"
                  icon={<LogoutIcon /> as any}
                  onClick={handleLogout}
                  bg="red.600"
                  _hover={{ bg: 'red.700' }}
                  color="white"
                  fontSize="sm"
                >
                  Sair da conta
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      {/* ── Conteúdo principal ───────────────────────────────── */}
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
        {/* Saudação */}
        <VStack align="flex-start" spacing={1} mb={8}>
          <HStack>
            <Heading size="lg" fontFamily="heading" fontWeight={700}>
              Bem-vindo de volta.
            </Heading>
            <Badge colorScheme="gray" variant="outline" borderRadius="2px" px={2}>
              Online
            </Badge>
          </HStack>
          <Text fontSize="sm">
            Gerencie seus campeonatos, jogadores e placares.
          </Text>
        </VStack>

        {/* Stats cards */}
        <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4} mb={8}>
          <Box
            bg="brand.surfaceLight"
            borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }} p={5}
          >
            <Stat>
              <StatLabel fontSize="xs" fontWeight={700} textTransform="uppercase" letterSpacing="wide">
                Meus Campeonatos
              </StatLabel>
              <StatNumber fontSize="3xl" fontWeight={700} color="brand.orange" lineHeight="1.2">
                {torneios.length}
              </StatNumber>
            </Stat>
          </Box>
        </SimpleGrid>

        <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} mb={8} />

        {/* Grid de torneios */}
        <VStack align="flex-start" spacing={2} mb={5}>
          <Heading size="md" fontFamily="heading">
            Meus Torneios
          </Heading>
          <Text opacity={0.6} fontSize="sm">
            Gerencie os campeonatos que você criou.
          </Text>
        </VStack>

        {loading ? (
          <Flex justify="center" py={10}>
            <Spinner color="brand.orange" />
          </Flex>
        ) : torneios.length === 0 ? (
          <Flex
            bg="brand.surfaceLight"
            p={10} borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}
            direction="column" align="center" justify="center"
          >
            <Text opacity={0.6} mb={4}>Você ainda não possui nenhum torneio.</Text>
            <Button onClick={() => navigate('/torneio/configurar')} variant="solid" bg="brand.orange" color="brand.dark" borderRadius="2px">
              Criar meu primeiro torneio
            </Button>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {torneios.map((t) => (
              <Box
                key={t.id}
                bg="brand.surfaceLight"
                borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}
                p={5} display="flex" flexDirection="column"
              >
                <HStack justify="space-between" mb={3}>
                  <Heading size="sm" fontFamily="heading" noOfLines={1}>{t.nome}</Heading>
                  <Badge variant="outline" colorScheme={t.formato === 'liga' ? 'orange' : 'purple'} borderRadius="2px">
                    {t.formato === 'liga' ? 'Liga' : 'Mata-mata'}
                  </Badge>
                </HStack>
                <Text fontSize="xs" opacity={0.6} mb={5}>
                  Atualizado em {new Date(t.atualizado_em).toLocaleDateString()}
                </Text>
                
                <HStack mt="auto" spacing={2} pt={4} borderTopWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}>
                  <Button
                    flex={1} size="sm" variant="solid" borderColor="brand.dark"
                    borderRadius="2px" onClick={() => handleAcessar(t)}
                  >
                    Acessar
                  </Button>
                  <Tooltip label="Copiar Link" placement="top">
                    <IconButton
                      aria-label="Copiar link"
                      icon={<LinkIcon /> as any}
                      size="sm"
                      variant="outline"
                      borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }}
                      borderRadius="2px"
                      onClick={() => handleGenerateLink(t.id)}
                    />
                  </Tooltip>
                  <Tooltip label="Excluir" placement="top">
                    <IconButton
                      aria-label="Excluir torneio"
                      icon={<TrashIcon /> as any}
                      size="sm"
                      variant="ghost"
                      color="red.600" _dark={{ color: 'red.400' }}
                      borderRadius="2px"
                      onClick={() => handleExcluir(t.id)}
                    />
                  </Tooltip>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        )}

      </Box>
    </Box>
  );
}
