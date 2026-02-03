export const pageVariants = {
  initial: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 1.05, filter: "blur(10px)" }
};

export const pageTransition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const };
