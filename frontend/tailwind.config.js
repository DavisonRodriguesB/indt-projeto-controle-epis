// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'epipim-bg': '#F9FAFB', // Fundo principal cinza claro
        'epipim-primary': '#475A83', // Azul escuro dos botões e títulos
        'epipim-primary-light': '#E8EDF5', // Azul muito claro para hover/seleção
        'epipim-accent': '#233261', // Azul escuro do logo e sidebar ativo
        'epipim-text-primary': '#111827', // Preto/Cinza escuro do texto principal
        'epipim-text-secondary': '#6B7280', // Cinza de placeholders e legendas
        'epipim-border': '#E5E7EB', // Cor das bordas
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Fonte mais próxima visualmente
      },
    },
  },
  plugins: [],
}