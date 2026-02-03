'use client';

export const createExplosionEffect = (x: number, y: number) => {
  const container = document.body;
  
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement("div");
    const angle = (Math.PI * 2 * i) / 12;
    const velocity = 80 + Math.random() * 40;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    particle.style.position = "fixed";
    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;
    particle.style.width = "8px";
    particle.style.height = "8px";
    particle.style.backgroundColor = ["#ff4444", "#ff6600", "#ffaa00", "#ff0000"][Math.floor(Math.random() * 4)];
    particle.style.borderRadius = "50%";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = "9999";
    particle.style.boxShadow = "0 0 10px currentColor";
    
    particle.animate([
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
      duration: 600 + Math.random() * 400,
      easing: "cubic-bezier(0, .9, .57, 1)"
    }).onfinish = () => particle.remove();
    
    container.appendChild(particle);
  }
  
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.left = `${x}%`;
  flash.style.top = `${y}%`;
  flash.style.width = "60px";
  flash.style.height = "60px";
  flash.style.backgroundColor = "#ffffff";
  flash.style.borderRadius = "50%";
  flash.style.pointerEvents = "none";
  flash.style.zIndex = "9999";
  flash.style.transform = "translate(-50%, -50%)";
  flash.style.boxShadow = "0 0 30px #ffffff, 0 0 60px #ff6600";
  
  flash.animate([
    { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
    { transform: "translate(-50%, -50%) scale(2)", opacity: 0 }
  ], {
    duration: 300,
    easing: "ease-out"
  }).onfinish = () => flash.remove();
  
  container.appendChild(flash);
};
