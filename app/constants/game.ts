export const MEMORIES = {
  campus: {
    url: "./cpgo.jpg",
    date: "21 NOV 2025",
    title: "O Encontro (CPBR)"
  },
  newYear: {
    url: "./ano_novo.jpeg",
    date: "31 DEZ 2023",
    title: "Nosso Ano Novo"
  },
  gallery: [
    { 
      id: 1, 
      url: "./primeiro.jpg", 
      date: "21 DEZ 2025", 
      title: "Nosso primeiro encontro de verdade" 
    },
    { 
      id: 2, 
      url: "./surpresa.jpg", 
      date: "17 JAN 2025", 
      title: "Aquela Viagem" 
    },
    { 
      id: 3, 
      url: "./ela_aqui.jpeg", 
      date: "25 JAN 2025", 
      title: "É incrível como sua presença é boa!" 
    },
    { 
      id: 4, 
      url: "./aleatoria.jpg", 
      date: "HOJE", 
      title: "Cada momento conta" 
    },
    {
      id: 5,
      url: "./proximos.png",
      date: "FUTURO",
      title: "Próximas Fases"
    }
  ]
};

export const LORE_DATA = {
  intro: {
    chapter: "Capítulo 01",
    title: "O Começo de Tudo",
    image: "./cpgo.jpg",
    date: "21 NOV 2025",
    text: "Foi onde o player 1 encontrou o player 2. No meio de tanta tecnologia, o melhor algoritmo foi o destino nos juntando."
  },
  celebration: {
    chapter: "Capítulo 02", 
    title: "Momentos de Alegria",
    image: "./ano_novo.jpeg",
    date: "31 DEZ 2023",
    text: "Cada celebração se torna especial quando compartilhamos com quem amamos. Risadas que ecoam no tempo."
  },
  distance: {
    chapter: "Capítulo 03",
    title: "Superando Obstáculos", 
    image: "./surpresa.jpg",
    date: "17 JAN 2025",
    text: "A distância é apenas um número quando dois corações estão conectados. Cada quilometro percorrido vale a pena."
  },
  stars: {
    chapter: "Capítulo 04",
    title: "Sob as Estrelas",
    image: "./ela_aqui.jpeg", 
    date: "25 JAN 2025",
    text: "Mesmo longe, olhamos para o mesmo céu. As estrelas são testemunhas silenciosas do nosso amor."
  },
  care: {
    chapter: "Capítulo 05",
    title: "Cuidado e Carinho",
    image: "./aleatoria.jpg",
    date: "HOJE", 
    text: "Cuidar um do outro é a forma mais pura de amor. Cada gesto pequeno constrói algo grande."
  }
};

export type LoreKey = keyof typeof LORE_DATA;

export const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3";

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

export const POINTS_TO_WIN = 20;
