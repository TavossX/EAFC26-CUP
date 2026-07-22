import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  SimpleGrid,
  Text,
  VStack,
  useToast,
  Badge,
  Divider,
  Wrap,
  WrapItem,
  Select,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTorneioStore } from '../store/torneioStore';
import type { FormatoTorneio } from '../types/torneio';

// ─── Times sugeridos ─────────────────────────────────────────────────────────
const TIMES_SUGERIDOS = [
  'Real Madrid', 'Manchester City', 'Barcelona', 'Bayern München',
  'PSG', 'Liverpool', 'Chelsea', 'Arsenal', 'Juventus', 'Inter Milan',
  'Atlético Madrid', 'Borussia Dortmund', 'AC Milan', 'Napoli',
  'Ajax', 'Benfica', 'Porto', 'Flamengo', 'São Paulo',
];

// ─── Ícones SVG ──────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const ShuffleIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4h6l2 2h8M4 20h6l2-2h8M15 9l3-3-3-3M15 15l3 3-3 3" />
  </svg>
);
const ResetIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  nomeTorneio: z.string().min(3, 'Nome muito curto'),
});
type FormData = z.infer<typeof schema>;

// ─── Componente ───────────────────────────────────────────────────────────────
export function ConfigurarTorneio() {
  const [formato, setFormato] = useState<FormatoTorneio>('liga');
  const [amigos, setAmigos] = useState<string[]>(['', '']);
  const [times, setTimes] = useState<string[]>(['', '']);
  const [novoAmigo, setNovoAmigo] = useState('');
  const [novoTime, setNovoTime] = useState('');
  
  // Etapas do Wizard
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Estados do Draft (Etapa 2 e 3)
  const [amigosPendentes, setAmigosPendentes] = useState<string[]>([]);
  const [timesDisponiveis, setTimesDisponiveis] = useState<string[]>([]);
  const [amigoSorteado, setAmigoSorteado] = useState<string | null>(null);
  const [timeSelecionado, setTimeSelecionado] = useState<string>('');
  const [duplas, setDuplas] = useState<{amigo: string; time: string}[]>([]);

  const toast = useToast();
  const navigate = useNavigate();
  const criarTorneio = useTorneioStore((s) => s.criarTorneio);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // ── Amigos (Etapa 1) ──────────────────────────────────────────────────────
  const adicionarAmigo = () => {
    const val = novoAmigo.trim();
    if (!val) return;
    if (amigos.includes(val)) {
      toast({ title: 'Participante já adicionado.', status: 'warning', duration: 2000, position: 'top' });
      return;
    }
    setAmigos((prev) => [...prev.filter(Boolean), val]);
    setNovoAmigo('');
  };
  const removerAmigo = (i: number) => setAmigos((prev) => prev.filter((_, idx) => idx !== i));
  const atualizarAmigo = (i: number, val: string) =>
    setAmigos((prev) => prev.map((a, idx) => (idx === i ? val : a)));

  // ── Times (Etapa 1) ───────────────────────────────────────────────────────
  const adicionarTime = (nome?: string) => {
    const val = (nome ?? novoTime).trim();
    if (!val) return;
    if (times.includes(val)) {
      toast({ title: 'Time já adicionado', status: 'warning', duration: 2000, position: 'top' });
      return;
    }
    setTimes((prev) => [...prev.filter(Boolean), val]);
    setNovoTime('');
  };
  const removerTime = (i: number) => setTimes((prev) => prev.filter((_, idx) => idx !== i));

  const amigosValidos = amigos.filter(Boolean);
  const timesValidos  = times.filter(Boolean);

  // ── Transição: Etapa 1 -> Etapa 2 ─────────────────────────────────────────
  const iniciarSorteio = handleSubmit(() => {
    if (amigosValidos.length < 2) {
      toast({ title: 'Adicione pelo menos 2 amigos', status: 'error', duration: 3000, position: 'top' }); return;
    }
    if (formato === 'matamata' && amigosValidos.length < 2) {
      toast({ title: 'Mata-mata precisa de pelo menos 2 jogadores', status: 'error', duration: 3000, position: 'top' }); return;
    }
    if (timesValidos.length < amigosValidos.length) {
      toast({
        title: `Você precisa de pelo menos ${amigosValidos.length} times`,
        description: `Faltam ${amigosValidos.length - timesValidos.length} time(s)`,
        status: 'error', duration: 4000, position: 'top',
      }); return;
    }

    setAmigosPendentes(amigosValidos);
    setTimesDisponiveis(timesValidos);
    setDuplas([]);
    setAmigoSorteado(null);
    setTimeSelecionado('');
    setStep(2);
  });

  // ── Sorteio (Etapa 2) ─────────────────────────────────────────────────────
  const sortearParticipante = () => {
    if (amigosPendentes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * amigosPendentes.length);
    setAmigoSorteado(amigosPendentes[randomIndex]);
    setTimeSelecionado(''); // Reseta a escolha anterior
  };

  const confirmarEVincular = () => {
    if (!amigoSorteado || !timeSelecionado) return;
    
    setDuplas((prev) => [...prev, { amigo: amigoSorteado, time: timeSelecionado }]);
    setAmigosPendentes((prev) => prev.filter((a) => a !== amigoSorteado));
    setTimesDisponiveis((prev) => prev.filter((t) => t !== timeSelecionado));
    
    setAmigoSorteado(null);
    setTimeSelecionado('');
  };

  // Auto-avanço para Etapa 3 quando terminar o draft
  useEffect(() => {
    if (step === 2 && amigosPendentes.length === 0 && duplas.length > 0 && !amigoSorteado) {
      setStep(3);
    }
  }, [step, amigosPendentes, duplas, amigoSorteado]);

  // ── Geração do Campeonato (Etapa 3) ───────────────────────────────────────
  const onGerarCampeonato = () => {
    criarTorneio({
      nome: getValues('nomeTorneio'),
      formato,
      duplas,
    });
    toast({ title: 'Torneio gerado com sucesso!', status: 'success', duration: 3000, position: 'top' });
    navigate(formato === 'liga' ? '/torneio/liga' : '/torneio/matamata');
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <Box minH="100vh" px={{ base: 4, md: 8 }} py={10}>
      <Box maxW="760px" mx="auto">
        {/* Header */}
        <VStack spacing={2} mb={8} align="flex-start">
          <Button size="xs" variant="solid" mb={2} onClick={() => navigate('/')} px={0} _hover={{ bg: 'transparent', color: 'brand.orange' }} leftIcon={<ResetIcon /> as any}>
            Voltar para o Dashboard
          </Button>
          <Heading size="xl" fontFamily="heading" fontWeight={800} letterSpacing="-0.5px">
            Configurar Campeonato
          </Heading>
          <Text fontSize="sm">
            Configure os dados e realize o Sorteio Interativo.
          </Text>
        </VStack>

        {/* Steps indicator */}
        <HStack spacing={0} mb={8}>
          {[1, 2, 3].map((s) => (
            <HStack key={s} spacing={0} flex={1}>
              <Flex
                w={8} h={8} borderRadius="2px" align="center" justify="center"
                fontSize="sm" fontWeight={700} flexShrink={0}
                bg={step >= s ? 'brand.orange' : 'transparent'}
                borderWidth={1}
                borderColor={step >= s ? 'brand.orange' : 'brand.dark'}
                _dark={{ borderColor: step >= s ? 'brand.orange' : 'whiteAlpha.300' }}
                color={step >= s ? 'brand.dark' : 'inherit'}
                transition="all 0.3s"
              >
                {s}
              </Flex>
              <Text
                ml={2} fontSize="xs" fontWeight={600} display={{ base: 'none', sm: 'block' }}
                color={step >= s ? 'brand.orange' : 'inherit'}
                opacity={step >= s ? 1 : 0.4}
                transition="color 0.3s"
              >
                {s === 1 ? 'Definição' : s === 2 ? 'Draft' : 'Resumo'}
              </Text>
              {s < 3 && <Box flex={1} h="1px" bg={step > s ? 'brand.orange' : 'brand.dark'} _dark={{ bg: step > s ? 'brand.orange' : 'whiteAlpha.300' }} mx={2} transition="all 0.3s" />}
            </HStack>
          ))}
        </HStack>

        {/* Card */}
        <Box
          bg="brand.surfaceLight"
          borderRadius="4px" borderWidth={1} borderColor="brand.dark" _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}
          p={{ base: 6, md: 8 }}
        >
          {/* ── Etapa 1: Definição de Dados ───────────────────────────────── */}
          {step === 1 && (
            <VStack spacing={8} align="stretch">
              
              {/* Formato e Nome */}
              <VStack spacing={4} align="stretch">
                <Heading size="md" fontFamily="heading">Informações Básicas</Heading>
                <FormControl isInvalid={!!errors.nomeTorneio}>
                  <FormLabel fontSize="sm">Nome do torneio</FormLabel>
                  <Input
                    {...register('nomeTorneio')}
                    placeholder="Copa de Inverno 2026"
                    variant="outline"
                  />
                  <FormErrorMessage fontSize="xs">{errors.nomeTorneio?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Formato</FormLabel>
                  <RadioGroup value={formato} onChange={(v) => setFormato(v as FormatoTorneio)}>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                      {[
                        { val: 'liga', titulo: 'Todos contra Todos', desc: 'Pontos Corridos. Ida e volta.' },
                        { val: 'matamata', titulo: 'Mata-mata', desc: 'Chaveamento. Pênaltis no desempate.' },
                      ].map(({ val, titulo, desc }) => (
                        <Box
                          key={val} as="label" cursor="pointer" borderRadius="4px" borderWidth={1}
                          borderColor={formato === val ? 'brand.orange' : 'brand.dark'}
                          bg={formato === val ? 'blackAlpha.50' : 'transparent'}
                          _dark={{ borderColor: formato === val ? 'brand.orange' : 'whiteAlpha.300', bg: formato === val ? 'whiteAlpha.50' : 'transparent' }}
                          p={4} transition="all 0.2s" _hover={{ borderColor: 'brand.orange' }}
                        >
                          <Radio value={val} display="none" />
                          <VStack align="flex-start" spacing={1}>
                            <Text fontWeight={700} fontSize="sm">{titulo}</Text>
                            <Text fontSize="xs" opacity={0.6}>{desc}</Text>
                          </VStack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </RadioGroup>
                </FormControl>
              </VStack>

              <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} />

              {/* Amigos */}
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="sm" fontFamily="heading">Amigos</Heading>
                  <Badge colorScheme="orange" variant="outline" borderRadius="2px" px={2}>
                    {amigosValidos.length} adicionados
                  </Badge>
                </HStack>
                <VStack spacing={2}>
                  {amigos.map((amigo, i) => (
                    <HStack key={`amigo-${i}`} w="full">
                      <Input
                        value={amigo} onChange={(e) => atualizarAmigo(i, e.target.value)}
                        placeholder={`Participante ${i + 1}`} variant="outline" size="sm"
                      />
                      <IconButton
                        aria-label="Remover" icon={<TrashIcon /> as any}
                        size="sm" variant="outline" colorScheme="red" onClick={() => removerAmigo(i)}
                        isDisabled={amigos.length <= 2}
                      />
                    </HStack>
                  ))}
                </VStack>
                <HStack>
                  <Input
                    value={novoAmigo} onChange={(e) => setNovoAmigo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && adicionarAmigo()}
                    placeholder="Adicionar outro..." variant="outline" size="sm"
                  />
                  <IconButton aria-label="Adicionar" icon={<PlusIcon /> as any} size="sm" onClick={adicionarAmigo} />
                </HStack>
              </VStack>

              <Divider borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} />

              {/* Times */}
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="sm" fontFamily="heading">Times Disponíveis</Heading>
                  <Badge colorScheme={timesValidos.length >= amigosValidos.length ? 'green' : 'red'} variant="outline" borderRadius="2px" px={2}>
                    {timesValidos.length}/{amigosValidos.length} mínimo
                  </Badge>
                </HStack>
                
                <Box>
                  <Text fontSize="2xs" mb={2} fontWeight={600} textTransform="uppercase" letterSpacing="wide">Sugestões</Text>
                  <Wrap spacing={2}>
                    {TIMES_SUGERIDOS.filter((t) => !timesValidos.includes(t)).map((t) => (
                      <WrapItem key={t}>
                        <Badge
                          cursor="pointer" variant="outline" borderRadius="2px" px={2} py={1} fontSize="xs"
                          _hover={{ bg: 'brand.orange', color: 'brand.dark', borderColor: 'brand.orange' }}
                          onClick={() => adicionarTime(t)}
                        >
                          + {t}
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>

                <Wrap spacing={2}>
                  {timesValidos.map((t, i) => (
                    <WrapItem key={`time-${i}`}>
                      <Badge
                        variant="solid" bg="brand.dark" color="brand.light" _dark={{ bg: 'brand.light', color: 'brand.dark' }}
                        borderRadius="2px" px={2} py={1} fontSize="xs" cursor="pointer" onClick={() => removerTime(i)}
                      >
                        {t} ✕
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>

                <HStack>
                  <Input
                    value={novoTime} onChange={(e) => setNovoTime(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && adicionarTime()}
                    placeholder="Time personalizado..." variant="outline" size="sm"
                  />
                  <IconButton aria-label="Adicionar" icon={<PlusIcon /> as any} size="sm" onClick={() => adicionarTime()} />
                </HStack>
              </VStack>

              <Button
                onClick={iniciarSorteio}
                variant="solid" bg="brand.orange" color="brand.dark" borderRadius="2px"
                size="lg" mt={6} rightIcon={<ShuffleIcon /> as any}
              >
                Iniciar Sorteio
              </Button>
            </VStack>
          )}

          {/* ── Etapa 2: Sorteio Interativo (Draft) ───────────────────────── */}
          {step === 2 && (
            <VStack spacing={8} align="stretch">
              <VStack spacing={1} textAlign="center">
                <Heading size="lg" fontFamily="heading">O Draft</Heading>
                <Text fontSize="sm" opacity={0.6}>
                  Sorteie o participante e escolha o time dele.
                </Text>
              </VStack>

              <HStack justify="center" spacing={4}>
                <Badge variant="outline" borderRadius="2px" px={3}>
                  {amigosPendentes.length} Pendentes
                </Badge>
                <Badge variant="outline" colorScheme="orange" borderRadius="2px" px={3}>
                  {duplas.length} Confirmados
                </Badge>
              </HStack>

              <Box p={6} borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} borderRadius="4px" textAlign="center" minH="240px" display="flex" flexDirection="column" justifyContent="center">
                {!amigoSorteado ? (
                  <VStack spacing={4}>
                    <Text fontSize="sm" opacity={0.6}>Pronto para sortear o próximo jogador?</Text>
                    <Button onClick={sortearParticipante} variant="solid" bg="brand.orange" color="brand.dark" size="lg" borderRadius="2px" leftIcon={<ShuffleIcon /> as any}>
                      Sortear Participante
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={6}>
                    <VStack spacing={0}>
                      <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" opacity={0.6} mb={2}>Participante Sorteado</Text>
                      <Heading size="2xl" fontFamily="heading" color="brand.orange">
                        {amigoSorteado}
                      </Heading>
                    </VStack>

                    <FormControl w="100%" maxW="300px" mx="auto">
                      <Select
                        placeholder="Escolha o time..."
                        value={timeSelecionado}
                        onChange={(e) => setTimeSelecionado(e.target.value)}
                        variant="outline"
                        borderRadius="4px"
                        borderWidth={2}
                        borderColor="brand.dark"
                        _dark={{ borderColor: 'whiteAlpha.400' }}
                      >
                        {timesDisponiveis.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      onClick={confirmarEVincular}
                      variant="solid"
                      size="md"
                      w="100%"
                      maxW="300px"
                      borderRadius="2px"
                      isDisabled={!timeSelecionado}
                    >
                      Confirmar e Vincular
                    </Button>
                  </VStack>
                )}
              </Box>
            </VStack>
          )}

          {/* ── Etapa 3: Resumo ───────────────────────────────────────────── */}
          {step === 3 && (
            <VStack spacing={6} align="stretch">
              <VStack spacing={1} textAlign="center">
                <Heading size="lg" fontFamily="heading">Resumo do Torneio</Heading>
                <Text fontSize="sm" opacity={0.6}>
                  Todos os times foram vinculados. Pronto para começar?
                </Text>
              </VStack>

              <Box borderWidth={1} borderColor="brand.dark" _dark={{ borderColor: 'whiteAlpha.300' }} borderRadius="4px" overflow="hidden">
                {duplas.map((d, i) => (
                  <Flex
                    key={i}
                    p={3}
                    borderBottomWidth={i < duplas.length - 1 ? 1 : 0}
                    borderColor="brand.dark"
                    justify="space-between"
                    align="center"
                    bg={i % 2 === 0 ? 'blackAlpha.50' : 'transparent'}
                    _dark={{ borderColor: 'whiteAlpha.300', bg: i % 2 === 0 ? 'whiteAlpha.50' : 'transparent' }}
                  >
                    <Text fontWeight={700} fontSize="sm">{d.amigo}</Text>
                    <Badge variant="solid" bg="brand.dark" color="brand.light" _dark={{ bg: 'brand.light', color: 'brand.dark' }} borderRadius="2px">
                      {d.time}
                    </Badge>
                  </Flex>
                ))}
              </Box>

              <Button
                onClick={onGerarCampeonato}
                variant="solid" bg="brand.orange" color="brand.dark" borderRadius="2px"
                size="lg" mt={4}
              >
                Gerar Campeonato
              </Button>
            </VStack>
          )}

        </Box>
      </Box>
    </Box>
  );
}
