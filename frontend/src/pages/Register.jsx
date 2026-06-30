import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient, { getApiErrorMessage } from '../utils/apiClient'
import { persistAuthSession, isAuthenticated } from '../utils/auth'
import etherxLogo from '../assets/etherx_transparent.png'
import { AUTH_CSS, AuthLeftPane, AppleIcon, GoogleIcon, PersonIcon, MailIcon, LockIcon, EyeIcon } from './authShared'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
}

export default function Register() {
  const [name, setName]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  
  const navigate = useNavigate()
  const cardRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated()) navigate('/', { replace: true })
  }, [navigate])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const res = await apiClient.post('/api/auth/register', { name, email, password })
      if (res.data.success) {
        persistAuthSession({ token: res.data.data.token, user: res.data.data.user })
        navigate('/', { replace: true })
        return
      }
      setError('Registration failed. Please try again.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Cannot connect to server. Make sure backend is running.'))
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <style>{AUTH_CSS}</style>
      <div className="auth-glow-accent" />

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="auth-split-wrapper"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          className="auth-floating-close"
          onClick={() => navigate('/')}
          title="Close"
        >
          ✕
        </button>

        <div className="auth-top-accent" />
        <AuthLeftPane isLogin={false} logoSrc={etherxLogo} />

        <motion.div
          className="auth-right-pane"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.img
            variants={itemVariants}
            src={etherxLogo}
            alt="EtherXMeet"
            className="auth-logo-mobile"
          />

          <motion.h2 variants={itemVariants} className="auth-form-title">
            Create Account
          </motion.h2>
          
          <motion.p variants={itemVariants} className="auth-form-sub">
            Join EtherXMeet and start collaborating.
          </motion.p>

          <motion.div variants={itemVariants} className="auth-social-group">
            <button
              type="button"
              className="auth-social-btn"
              onClick={() => { window.location.href = `${API_BASE}/api/auth/apple` }}
            >
              <AppleIcon /> Apple
            </button>
            <button
              type="button"
              className="auth-social-btn"
              onClick={() => { window.location.href = `${API_BASE}/api/auth/google` }}
            >
              <GoogleIcon /> Google
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="auth-divider">
            or use credentials
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} className="auth-error-box">
              <span>⚠</span> {error}
            </motion.div>
          )}

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-wrap">
              <PersonIcon />
              <input
                className="auth-input"
                type="text"
                placeholder="Your Display Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-wrap">
              <MailIcon />
              <input
                className="auth-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-wrap">
              <LockIcon />
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password (min. 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="auth-eye-btn"
                tabIndex={-1}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-cta-btn"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </motion.form>

          <motion.p variants={itemVariants} className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">Log in</Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}
