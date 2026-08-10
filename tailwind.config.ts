import type { Config } from 'tailwindcss';

// Sistema de diseño "Etiqueta de ropa":
// La prenda física lleva una etiqueta colgada de un cordel. Ese objeto
// (cartón kraft + cordel + perforación) es la referencia visual de toda la app.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F4EF', // cartón claro de fondo
        ink: '#211F1C', // tinta casi negra, cálida
        hilo: {
          DEFAULT: '#2F6F62', // verde hilo — color de marca / acciones principales
          dark: '#234F45',
          light: '#E4EEEB',
        },
        cordel: {
          DEFAULT: '#C98A2C', // ámbar cordel — acentos, precios, énfasis
          light: '#F6E7CE',
        },
        estado: {
          disponible: '#2F8F5B',
          disponibleBg: '#E4F3EA',
          reservado: '#C98A2C',
          reservadoBg: '#F6E7CE',
          vendido: '#5B6472',
          vendidoBg: '#E7E9EC',
          entregado: '#3167A6',
          entregadoBg: '#E2EBF6',
          retirado: '#8B8579',
          retiradoBg: '#EDEBE5',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        tag: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
