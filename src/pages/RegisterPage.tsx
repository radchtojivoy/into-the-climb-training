import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Field } from '../components/ui/Field'
import { WheelPicker } from '../components/ui/WheelPicker'
import {
  GRADE_OS_DEFAULT,
  GRADE_RP_DEFAULT,
  GRADE_VALUES,
  HEIGHT_DEFAULT,
  HEIGHT_VALUES,
  WEIGHT_DEFAULT,
  WEIGHT_VALUES,
} from '../lib/wheelData'

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gym, setGym] = useState('')
  const [telegram, setTelegram] = useState('')
  const [weight, setWeight] = useState(WEIGHT_DEFAULT)
  const [height, setHeight] = useState(HEIGHT_DEFAULT)
  const [gradeRp, setGradeRp] = useState(GRADE_RP_DEFAULT)
  const [gradeOs, setGradeOs] = useState(GRADE_OS_DEFAULT)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Пароль має містити щонайменше 6 символів')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          birth_date: birthDate,
          gym,
          telegram,
          weight_kg: weight,
          height_cm: height,
          grade_rp: gradeRp,
          grade_os: gradeOs,
        },
      },
    })
    setLoading(false)

    if (error) {
      setError(error.message === 'User already registered' ? 'Такий email вже зареєстрований' : error.message)
      return
    }

    if (data.session) {
      navigate('/', { replace: true })
    } else {
      setCheckEmail(true)
    }
  }

  if (checkEmail) {
    return (
      <div className="screen">
        <div className="screen-pad" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
          <h2 className="h-mid">Перевір пошту</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
            Ми надіслали лист на {email}. Підтверди адресу, а потім увійди з паролем, який щойно вказав(ла).
          </p>
          <Link to="/login" className="btn-main" style={{ textDecoration: 'none' }}>
            До входу
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div style={{ flex: 1, paddingTop: 24, paddingBottom: 32 }}>
        <div className="reg-title">
          <h2 className="h-mid">Створи профіль</h2>
          <p>Тренер отримає заявку і відкриє тобі доступ до програми.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-sec">
            <h3>Вхід</h3>
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
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-sec">
            <h3>Про тебе</h3>
            <Field
              label="Ім'я та прізвище"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Field
              label="Дата народження"
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <Field label="Скеледром" type="text" value={gym} onChange={(e) => setGym(e.target.value)} />
            <Field
              label="Нік у Telegram"
              type="text"
              placeholder="@nick"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
          </div>

          <div className="form-sec">
            <h3>Антропометрія</h3>
            <div className="wheels">
              <WheelPicker label="Вага, кг" values={WEIGHT_VALUES} value={weight} onChange={setWeight} />
              <WheelPicker label="Зріст, см" values={HEIGHT_VALUES} value={height} onChange={setHeight} />
            </div>
          </div>

          <div className="form-sec">
            <h3>Рівень лазіння</h3>
            <div className="wheels">
              <WheelPicker label="Найкращий RP" values={GRADE_VALUES} value={gradeRp} onChange={setGradeRp} />
              <WheelPicker label="Найкращий онсайт" values={GRADE_VALUES} value={gradeOs} onChange={setGradeOs} />
            </div>
          </div>

          {error && (
            <span className="error" style={{ display: 'block', marginTop: 12, padding: '0 20px' }}>
              {error}
            </span>
          )}

          <div className="reg-foot">
            <button className="btn-main" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Надіслати заявку тренеру'}
            </button>
            <p>
              Вже маєш акаунт? <Link to="/login" className="btn-link">Увійти</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
