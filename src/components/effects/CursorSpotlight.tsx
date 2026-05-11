import { useEffect, useRef } from "react";

interface CursorSpotlightProps {
  size?: number;
  color?: string;
  opacity?: number;
}

/**
 * Fixed, pointer-events-none radial gradient that follows the cursor.
 * Hidden on touch devices and when prefers-reduced-motion is set.
 */
export const CursorSpotlight = ({
  size = 480,
  color = "hsl(var(--accent))",
  opacity = 0.12,
}: CursorSpotlightProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let pending = false;

    const apply = () => {
      pending = false;
      if (el) el.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(apply);
      }
    };

    el.style.opacity = "1";
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [size]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[1] opacity-0 transition-opacity duration-500 mix-blend-screen"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
        filter: "blur(40px)",
        opacity,
        willChange: "transform",
      }}
    />
  );
};
