import {
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Link,
    Text,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import LogoBira from '../assets/logos/Logo.png';

/* ── Validação ─────────────────────────────────────────────── */
const registerSchema = z
  .object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Informe um e-mail válido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme sua senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterData = z.infer<typeof registerSchema>;

/* ── Ícones SVG ─────────────────────────────────────────────── */
const PersonIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const EmailIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

/* ── Página ─────────────────────────────────────────────────── */
export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async ({ email, password, nome }: RegisterData) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },           // salva o nome nos metadados do usuário
      },
    });

    if (error) {
      toast({
        title: 'Erro ao criar conta.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    toast({
      title: 'Conta criada.',
      description: 'Verifique seu e-mail para confirmar o cadastro.',
      status: 'success',
      duration: 6000,
      isClosable: true,
      position: 'top',
    });
    navigate('/login');
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      position="relative"
      px={4}
      py={10}
    >
      {/* Card */}
      <Box
        w="full" maxW="460px"
        bg="brand.surfaceLight"
        borderWidth={1}
        borderColor="brand.dark"
        _dark={{ bg: 'brand.surfaceDark', borderColor: 'whiteAlpha.300' }}
        position="relative"
        zIndex={1}
      >
        <Box p={{ base: 7, md: 10 }}>
          {/* Ícone */}
          <Flex justify="center" mb={5}>
            <Image src={LogoBira} alt="Bar do Bira" w={{ base: '160px', md: '200px' }} />
          </Flex>

          <VStack spacing={1} mb={7} textAlign="center">
            <Heading size="lg" fontWeight={700} fontFamily="heading">
              Criar conta
            </Heading>
            <Text fontSize="sm">
              Junte-se ao Bar do Bira Cup
            </Text>
          </VStack>

          <VStack as="form" onSubmit={handleSubmit(onSubmit)} spacing={4}>
            {/* Nome */}
            <FormControl isInvalid={!!errors.nome}>
              <FormLabel fontSize="sm" mb={1.5}>Nome</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <PersonIcon />
                </InputLeftElement>
                <Input
                  {...register('nome')}
                  id="register-nome"
                  placeholder="Seu nome completo"
                  variant="outline"
                />
              </InputGroup>
              <FormErrorMessage fontSize="xs">{errors.nome?.message}</FormErrorMessage>
            </FormControl>

            {/* E-mail */}
            <FormControl isInvalid={!!errors.email}>
              <FormLabel fontSize="sm" mb={1.5}>E-mail</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <EmailIcon />
                </InputLeftElement>
                <Input
                  {...register('email')}
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  variant="outline"
                />
              </InputGroup>
              <FormErrorMessage fontSize="xs">{errors.email?.message}</FormErrorMessage>
            </FormControl>

            {/* Senha */}
            <FormControl isInvalid={!!errors.password}>
              <FormLabel fontSize="sm" mb={1.5}>Senha</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <LockIcon />
                </InputLeftElement>
                <Input
                  {...register('password')}
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  variant="outline"
                />
                <InputRightElement h="full">
                  <Button
                    variant="solid" size="sm" p={1}
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    <EyeIcon open={showPassword} />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage fontSize="xs">{errors.password?.message}</FormErrorMessage>
            </FormControl>

            {/* Confirmar senha */}
            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel fontSize="sm" mb={1.5}>Confirmar Senha</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <LockIcon />
                </InputLeftElement>
                <Input
                  {...register('confirmPassword')}
                  id="register-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repita sua senha"
                  variant="outline"
                />
                <InputRightElement h="full">
                  <Button
                    variant="solid" size="sm" p={1}
                    onClick={() => setShowConfirm((p) => !p)}
                  >
                    <EyeIcon open={showConfirm} />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage fontSize="xs">{errors.confirmPassword?.message}</FormErrorMessage>
            </FormControl>

            <Button
              id="btn-register"
              type="submit"
              w="full"
              size="lg"
              mt={2}
              isLoading={isSubmitting}
              loadingText="Criando conta..."
              variant="solid"
            >
              Criar conta
            </Button>
          </VStack>

          <Text textAlign="center" mt={6} fontSize="sm">
            Já tem uma conta?{' '}
            <Link
              as={RouterLink}
              to="/login"
              color="brand.orange"
              fontWeight={600}
              _hover={{ textDecoration: 'underline' }}
            >
              Entrar agora
            </Link>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
