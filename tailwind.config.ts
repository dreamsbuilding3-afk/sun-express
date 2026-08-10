import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charte graphique Sun Express
        "se-primaire": "#8B2613", // Rouge brique / terracotta
        "se-primaire-fonce": "#6E1D0E",
        "se-fond": "#FDFBF7", // Beige sable doux
        "se-carte": "#F4EBE2",
        "se-texte": "#2C1A14", // Marron très foncé
      },
    },
  },
  plugins: [],
};

export default config;

