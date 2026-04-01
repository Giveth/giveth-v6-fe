'use client'

import { motion } from 'framer-motion'

export function EtherealOrb({ size = 64 }: { size?: number }) {
  const scale = size / 64
  const px = (value: number) => `${value * scale}px`
  const scaled = (value: number) => value * scale

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* SVG noise filter definition */}
      <svg className="absolute" width="0" height="0">
        <defs>
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.95"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend mode="soft-light" in="SourceGraphic" result="noisy" />
          </filter>
        </defs>
      </svg>

      {/* Breathing + floating wrapper */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        animate={{
          scale: [1, 1.08, 1],
          y: [0, -2, 0],
        }}
        transition={{
          duration: 7,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        {/* Layer 1: Outermost ambient glow */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
          style={{
            width: scaled(62),
            height: scaled(62),
            background:
              'radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(124,58,237,0.25) 40%, rgba(124,58,237,0.05) 70%, transparent 100%)',
            filter: `blur(${px(8)})`,
          }}
        />

        {/* Layer 2: Secondary glow with rotation for morphing */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.06, 1],
          }}
          transition={{
            rotate: {
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
            },
            scale: {
              duration: 9,
              ease: 'easeInOut',
              repeat: Infinity,
            },
          }}
          style={{
            width: scaled(49),
            height: scaled(49),
            background:
              'radial-gradient(ellipse at 40% 35%, rgba(37,99,235,0.7) 0%, rgba(124,58,237,0.5) 45%, rgba(124,58,237,0.1) 80%, transparent 100%)',
            filter: `blur(${px(5)})`,
          }}
        />

        {/* Layer 3: Main orb body */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            rotate: [0, -180, 0],
            skewX: [0, 2, -2, 0],
            skewY: [0, -2, 2, 0],
          }}
          transition={{
            duration: 14,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'loop',
          }}
          style={{
            width: scaled(41),
            height: scaled(41),
            background:
              'radial-gradient(circle at 38% 38%, rgba(255,255,255,0.8) 0%, rgba(37,99,235,0.9) 25%, rgba(124,58,237,0.85) 55%, rgba(37,99,235,0.6) 80%, transparent 100%)',
            filter: `blur(${px(5)})`,
          }}
        />

        {/* Layer 4: Grain/noise overlay */}
        <motion.div
          className="absolute rounded-full overflow-hidden opacity-50"
          animate={{
            opacity: [0.3, 0.55, 0.4],
          }}
          transition={{
            duration: 5,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
          style={{
            width: scaled(44),
            height: scaled(44),
            filter: `blur(${px(1)})`,
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              filter: 'url(#grain)',
              background:
                'radial-gradient(circle at 38% 38%, rgba(255,255,255,0.5) 0%, rgba(37,99,235,0.6) 30%, rgba(124,58,237,0.5) 60%, transparent 100%)',
            }}
          />
        </motion.div>

        {/* Layer 5: Bright inner core highlight */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 6,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
          style={{
            width: scaled(19),
            height: scaled(19),
            background:
              'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 30%, rgba(37,99,235,0.3) 60%, transparent 100%)',
            filter: `blur(${px(3)})`,
          }}
        />

        {/* Layer 6: Wandering accent blob */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            x: [0, scaled(4), scaled(-3), 0],
            y: [0, scaled(-3), scaled(4), 0],
            scale: [1, 1.15, 0.9, 1],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{
            duration: 11,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
          style={{
            width: scaled(26),
            height: scaled(26),
            background:
              'radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(37,99,235,0.3) 50%, transparent 100%)',
            filter: `blur(${px(4)})`,
          }}
        />
      </motion.div>
    </div>
  )
}
