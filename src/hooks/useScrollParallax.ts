import { useEffect, useRef } from "react";

/**
 * Applies a GPU-only translateY transform proportional to scrollY.
 * Returns a ref to attach to the parallax target. Disabled when
 * prefers-reduced-motion is set.
 *
 * @param speed Multiplier — 0.2 = subtle, 0.5 = strong. Negative inverts direction.
 */
export function useScrollParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let pending = false;

    const apply = () => {
      pending = false;
      const y = window.scrollY * speed;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    const onScroll = () => {
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(apply);
      }
    };

    el.style.willChange = "transform";
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return ref;
}
