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
    | 'play'
    | 'cam'
    | 'plus'
    | 'trash'
    | 'link'
    | 'save'
    | 'copy'
    | 'search'
  className?: string
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  )
}
