import { useEffect, useRef } from 'react'

const ITEM_HEIGHT = 40

interface WheelPickerProps {
  label: string
  values: string[]
  value: string
  onChange: (value: string) => void
}

export function WheelPicker({ label, values, value, onChange }: WheelPickerProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const skipNextScroll = useRef(false)

  useEffect(() => {
    const ul = listRef.current
    if (!ul) return
    const index = Math.max(0, values.indexOf(value))
    skipNextScroll.current = true
    ul.scrollTop = index * ITEM_HEIGHT
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleScroll() {
    const ul = listRef.current
    if (!ul) return
    if (skipNextScroll.current) {
      skipNextScroll.current = false
      return
    }
    requestAnimationFrame(() => {
      const index = Math.round(ul.scrollTop / ITEM_HEIGHT)
      const next = values[Math.min(Math.max(index, 0), values.length - 1)]
      if (next !== undefined && next !== value) onChange(next)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    const ul = listRef.current
    if (!ul) return
    if (e.key === 'ArrowDown') {
      ul.scrollTop += ITEM_HEIGHT
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      ul.scrollTop -= ITEM_HEIGHT
      e.preventDefault()
    }
  }

  function handleClick(v: string, index: number) {
    listRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' })
    onChange(v)
  }

  return (
    <div className="wheel-box">
      <span className="wl">{label}</span>
      <div className="wheel">
        <ul
          ref={listRef}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuetext={value}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
        >
          {values.map((v, i) => (
            <li key={v} className={v === value ? 'sel' : undefined} onClick={() => handleClick(v, i)}>
              {v}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
