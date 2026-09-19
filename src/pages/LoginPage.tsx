import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Field } from '../components/ui/Field'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Невірний email або пароль')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="screen">
      <div className="screen-pad" style={{ flex: 1, paddingTop: 24, paddingBottom: 32 }}>
        <div className="reg-top">
          <img src="/brand/logo.png" alt="Into the Climb" />
        </div>
        <div className="reg-title">
          <h2 className="h-mid">Вхід</h2>
          <p>Введи email і пароль, які вказував(ла) при реєстрації.</p>
        </div>
        <form className="form-sec" onSubmit={handleSubmit}>
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Пароль"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <span className="error">{error}</span>}
          <div className="reg-foot">
            <button className="btn-main" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Увійти'}
            </button>
            <p>
              Ще не маєш акаунту? <Link to="/register" className="btn-link">Зареєструйся</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
