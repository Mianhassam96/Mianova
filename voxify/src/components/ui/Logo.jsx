import { useState } from 'react'
import { Link } from 'react-router-dom'

const LETTERS = ['M', 'i', 'a', 'n', 'o', 'v', 'a']

// Each letter gets a unique color stop in the gradient
const COLORS = [
  '#6366f1', // M - indigo
  '#7c3aed', // i - violet
  '#8b5cf6', // a - purple
  '#a855f7', // n - fuchsia
  '#06b6d4', // o - cyan
  '#0ea5e9', // v - sky
  '#6366f1', // a - indigo
]

export function Logo({ size = 'md', linkTo = '/' }) {
  const [hovered, setHovered] = useState(false)
  const [clickBurst, setClickBurst] = useState(false)

  const sizes = {
    sm: { text: 'text-lg', icon: 'w-7 h-7 text-sm', gap: 'gap-2' },
    md: { text: 'text-xl', icon: 'w-9 h-9 text-base', gap: 'gap-2.5' },
    lg: { text: 'text-3xl', icon: 'w-12 h-12 text-xl', gap: 'gap-3' },
  }
  const s = sizes[size]

  const handleClick = () => {
    setClickBurst(true)
    setTimeout(() => setClickBurst(false), 600)
  }

  return (
    <Link
      to={linkTo}
      className={`flex items-center ${s.gap} group select-none`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300 scale-110`} />
        {/* Burst ring on click */}
        {clickBurst && (
          <div className="absolute inset-0 rounded-xl border-2 border-indigo-400 animate-ping opacity-75" />
        )}
        {/* Icon box */}
        <div className={`relative ${s.icon} rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-110 transition-all duration-300`}>
          {/* Sound wave lines inside icon */}
          <div className="flex items-center gap-px">
            {[3, 5, 7, 5, 3].map((h, i) => (
              <span
                key={i}
                className="w-0.5 rounded-full bg-white/90"
                style={{
                  height: `${hovered ? h * 1.4 : h}px`,
                  transition: `height 0.2s ease ${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Text */}
      <div className={`${s.text} font-black tracking-tight flex items-baseline`}>
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            className="inline-block transition-all duration-300 relative"
            style={{
              color: hovered ? COLORS[i] : undefined,
              transform: hovered
                ? `translateY(${Math.sin(i * 1.2) * -3}px) rotate(${(i - 2.5) * 1.5}deg)`
                : 'none',
              transitionDelay: `${i * 30}ms`,
              textShadow: hovered ? `0 0 20px ${COLORS[i]}60` : 'none',
              // Base gradient when not hovered
              background: !hovered
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)'
                : undefined,
              WebkitBackgroundClip: !hovered ? 'text' : undefined,
              WebkitTextFillColor: !hovered ? 'transparent' : undefined,
              backgroundClip: !hovered ? 'text' : undefined,
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </Link>
  )
}
