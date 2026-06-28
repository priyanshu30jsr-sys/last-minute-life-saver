import { useRef, useCallback } from 'react';

export const use3DTilt = (intensity = 15) => {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    el.style.transform =
      `perspective(1000px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) scale(1.02)`;
    el.style.transition = 'transform 0.1s ease';
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.transition = 'transform 0.4s ease';
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
};