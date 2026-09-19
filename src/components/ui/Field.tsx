import type { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Field({ label, error, id, ...inputProps }: FieldProps) {
  const inputId = id ?? label
  return (
    <label className="field" htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} {...inputProps} />
      {error && <span className="error">{error}</span>}
    </label>
  )
}
