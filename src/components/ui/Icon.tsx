import type { CSSProperties } from 'react'

interface IconProps {
  name:
    | 'cal'
    | 'book'
    | 'home'
    | 'lib'
    | 'back'
    | 'next'
    | 'arrow'
    | 'down'
    | 'check'
    | 'x'
    | 'half'
    | 'play'
    | 'cam'
    | 'plus'
    | 'trash'
    | 'link'
    | 'lock'
    | 'smile'
    | 'save'
    | 'copy'
    | 'search'
    | 'list'
    | 'img'
    | 'timer'
  className?: string
  style?: CSSProperties
}

export function Icon({ name, className, style }: IconProps) {
  return (
    <svg className={className} style={style} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  )
}
