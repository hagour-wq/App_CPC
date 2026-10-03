import type { PointerEvent } from 'react';
export function usePointerGlow() {
  return (e: PointerEvent<HTMLElement>) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - box.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - box.top}px`);
    e.currentTarget.style.setProperty(
      '--rx',
      `${(-(e.clientY - box.top - box.height / 2) / box.height) * 6}deg`,
    );
    e.currentTarget.style.setProperty(
      '--ry',
      `${((e.clientX - box.left - box.width / 2) / box.width) * 6}deg`,
    );
  };
}
