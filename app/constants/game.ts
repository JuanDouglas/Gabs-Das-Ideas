export const MEMORIES = {
  campus: {
    url: "./images/cpgo.jpg",
    date: "21 NOV 2025",
    title: "O Encontro (CPBR)"
  },
  newYear: {
    url: "./images/ano_novo.jpeg",
    date: "31 DEZ 2023",
    title: "Nosso Ano Novo"
  },
  gallery: [
    { 
      id: 1, 
      url: "./images/primeiro.jpg", 
      date: "21 DEZ 2025", 
      title: "Nosso primeiro encontro de verdade" 
    },
    { 
      id: 2, 
      url: "./images/surpresa.jpg", 
      date: "17 JAN 2025", 
      title: "Aquela Viagem" 
    },
    { 
      id: 3, 
      url: "./images/ela_aqui.jpeg", 
      date: "25 JAN 2025", 
      title: "É incrível como sua presença é boa!" 
    },
    { 
      id: 4, 
      url: "./images/aleatoria.jpg", 
      date: "HOJE", 
      title: "Cada momento conta" 
    },
    {
      id: 5,
      url: "./images/proximos.png",
      date: "FUTURO",
      title: "Próximas Fases"
    }
  ]
};

export const LORE_DATA = {
  intro: {
    chapter: "Capítulo 01",
    title: "O Começo de Tudo",
    image: "./images/cpgo.jpg",
    date: "21 NOV 2025",
    text: "Foi o dia em que o player 1 encontrou o player 2. Em meio a tanta tecnologia, o melhor algoritmo foi o destino juntando a gente."
  },
  celebration: {
    chapter: "Capítulo 02", 
    title: "Momentos de Alegria",
    image: "./images/ano_novo.jpeg",
    date: "31 DEZ 2023",
    text: "Toda celebração fica maior quando é com quem a gente ama. Risos que continuam ecoando no tempo."
  },
  distance: {
    chapter: "Capítulo 03",
    title: "Superando Obstáculos", 
    image: "./images/surpresa.jpg",
    date: "17 JAN 2025",
    text: "A distância vira só número quando dois corações estão conectados. Cada quilômetro percorrido valeu a pena."
  },
  stars: {
    chapter: "Capítulo 04",
    title: "Sob as Estrelas",
    image: "./images/ela_aqui.jpeg", 
    date: "25 JAN 2025",
    text: "Mesmo longe, a gente olha para o mesmo céu. As estrelas guardam silêncio, mas testemunham o nosso amor."
  },
  care: {
    chapter: "Capítulo 05",
    title: "Cuidado e Carinho",
    image: "./images/aleatoria.jpg",
    date: "HOJE", 
    text: "Cuidar um do outro é a forma mais pura de amor. Cada gesto pequeno constrói algo grande."
  }
};

export type LoreKey = keyof typeof LORE_DATA;

export const MUSIC_URL = "./sounds/background.mp3";

export const STEPS = {
  INTRO: 0,
  LORE_1: 1,
  LEVEL_1: 2, 
  LORE_2: 3,
  LEVEL_2: 4,
  LORE_3: 5, 
  LEVEL_3: 6,
  LORE_4: 7,
  LEVEL_4: 8,
  LORE_5: 9,
  LEVEL_5: 10,
  FINAL: 11
};

export const POINTS_TO_WIN = 30;
