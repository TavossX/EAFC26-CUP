import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    orange: '#E48F22',
    dark: '#2B231D',
    light: '#F7F5F0',
    gray: '#6B625B',
    surfaceLight: '#EBE6DF',
    surfaceDark: '#3A3129'
  },
};

const fonts = {
  heading: `'Cinzel', serif`,
  body: `'Inter', sans-serif`,
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: '5px',
      fontWeight: '600',
    },
    variants: {
      solid: () => ({
        bg: 'brand.orange',
        color: 'brand.dark',
        _hover: {
          bg: '#CC7C1A',
          boxShadow: 'none',
        },
      }),
      outline: (props: any) => ({
        borderColor: props.colorMode === 'dark' ? 'brand.light' : 'brand.dark',
        color: props.colorMode === 'dark' ? 'brand.light' : 'brand.dark',
        _hover: {
          bg: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.100',
        },
      }),
    },
  },
  Card: {
    baseStyle: (props: any) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'brand.surfaceDark' : 'brand.surfaceLight',
        borderRadius: '4px',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? 'whiteAlpha.300' : 'brand.dark',
        boxShadow: 'none', // Remove as sombras padrão
      }
    })
  },
  Input: {
    variants: {
      outline: (props: any) => ({
        field: {
          borderRadius: '2px',
          borderColor: props.colorMode === 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400',
          _focus: {
            borderColor: 'brand.orange',
            boxShadow: 'none', // Sem brilho (glow) de foco
          }
        }
      })
    }
  }
};

const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'brand.dark' : 'brand.light',
      color: props.colorMode === 'dark' ? 'brand.light' : 'brand.dark',
    },
  }),
};

export const theme = extendTheme({ config, colors, fonts, components, styles });
