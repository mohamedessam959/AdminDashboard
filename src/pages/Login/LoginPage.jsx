import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { MdSchool } from 'react-icons/md'
import { en } from '../../locale/en'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [email, setEmail]   = useState('')
  const [password, setPass] = useState('')
  const [error, setError]   = useState('')
  const { login }           = useAuthStore()
  const navigate            = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email) { setError(en.login.errorEmail); return }
    const result = login(email)
    if (result.success) navigate('/dashboard')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}><MdSchool size={22} /></div>
          <div>
            <h1 className={styles.logoTitle}>{en.app.shortTitle}</h1>
            <p className={styles.logoSub}>{en.login.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>{en.login.email}</label>
            <input
              className="uni-input"
              style={{ width: '100%' }}
              type="email"
              placeholder="admin@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>{en.login.password}</label>
            <input
              className="uni-input"
              style={{ width: '100%' }}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className="btn-primary-uni" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
            {en.login.signIn}
          </button>
          <p className={styles.hint}>{en.login.demoHint}</p>
        </form>
      </div>
    </div>
  )
}
