interface HoldIconProps {
  holdShape: string
  color: string
  className?: string
}

// Іконка-зачіпка для типу тренування: кольорова форма з невеликим "отвором" по центру.
export function HoldIcon({ holdShape, color, className }: HoldIconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <use href={`#${holdShape}`} fill={color} />
      <circle cx="20" cy="20" r="3.2" fill="var(--paper)" opacity={0.8} />
    </svg>
  )
}
