import { motion } from "framer-motion";

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  animate?: boolean;
}

/**
 * AIKO animated brand mark.
 * Geometric "A" formed by intersecting gradient strokes with aurora shimmer.
 * Pure SVG + Framer Motion. Respects prefers-reduced-motion via CSS.
 */
export const Logo = ({ size = 32, withWordmark = true, className = "", animate = true }: LogoProps) => {
  const Mark = (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={animate ? { opacity: 0, scale: 0.8, rotate: -8 } : false}
      animate={animate ? { opacity: 1, scale: 1, rotate: 0 } : false}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="aiko-logo-mark"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aiko-grad-a" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(217 91% 60%)" />
          <stop offset="50%" stopColor="hsl(271 81% 56%)" />
          <stop offset="100%" stopColor="hsl(189 94% 55%)" />
        </linearGradient>
        <linearGradient id="aiko-grad-b" x1="40" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(189 94% 55%)" />
          <stop offset="100%" stopColor="hsl(271 81% 56%)" />
        </linearGradient>
        <filter id="aiko-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background rounded square with subtle gradient */}
      <rect x="1" y="1" width="38" height="38" rx="10" fill="hsl(0 0% 12%)" stroke="url(#aiko-grad-a)" strokeWidth="1.2" opacity="0.9" />

      {/* Animated A mark — two diagonal strokes + crossbar */}
      <g filter="url(#aiko-glow)">
        <motion.path
          d="M 11 30 L 20 10"
          stroke="url(#aiko-grad-a)"
          strokeWidth="2.6"
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={animate ? { pathLength: 1 } : false}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        />
        <motion.path
          d="M 20 10 L 29 30"
          stroke="url(#aiko-grad-b)"
          strokeWidth="2.6"
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={animate ? { pathLength: 1 } : false}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
        />
        <motion.path
          d="M 14.5 23 L 25.5 23"
          stroke="hsl(0 0% 98%)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.95"
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={animate ? { pathLength: 1, opacity: 0.95 } : false}
          transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
        />
      </g>

      {/* Subtle aurora shimmer dot */}
      <motion.circle
        cx="20"
        cy="20"
        r="1.5"
        fill="hsl(189 94% 75%)"
        initial={animate ? { opacity: 0 } : false}
        animate={animate ? { opacity: [0, 0.8, 0], scale: [0.5, 1.5, 0.5] } : false}
        transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );

  if (!withWordmark) return <span className={className}>{Mark}</span>;

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {Mark}
      <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
        AIKO
      </span>
    </span>
  );
};
