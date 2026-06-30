import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient, { getApiErrorMessage } from '../utils/apiClient'
import { persistAuthSession, isAuthenticated } from '../utils/auth'
import etherxLogo from '../assets/etherx_transparent.png'
import { AUTH_CSS, AuthLeftPane, AppleIcon, GoogleIcon, MailIcon, LockIcon, EyeIcon } from './authShared'
import { loginWithWeb3Auth } from '../utils/web3authClient'

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

export default function Login() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe]     = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)

  // Forgot password flow states
  const [isForgotMode, setIsForgotMode]   = useState(false)
  const [forgotEmail, setForgotEmail]     = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [forgotError, setForgotError]     = useState('')

  const navigate = useNavigate()
  const cardRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true })
      return
    }
    // Load remembered email
    const savedEmail = localStorage.getItem('etherxmeet_remember_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [navigate])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    try {
      const res = await apiClient.post('/api/auth/login', { email, password })
      if (res.data.success) {
        persistAuthSession({ token: res.data.data.token, user: res.data.data.user })
        if (rememberMe) {
          localStorage.setItem('etherxmeet_remember_email', email)
        } else {
          localStorage.removeItem('etherxmeet_remember_email')
        }
        navigate('/', { replace: true })
        return
      }
      setError('Login failed. Please try again.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'))
    }
    setLoading(false)
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')
    if (!forgotEmail) { setForgotError('Please enter your email.'); return }
    setForgotLoading(true)
    try {
      const res = await apiClient.post('/api/auth/forgot-password', { email: forgotEmail })
      if (res.data.success) {
        setForgotSuccess(res.data.message || 'Reset link sent! Please check your email inbox.')
        setForgotEmail('')
      } else {
        setForgotError(res.data.message || 'Failed to request reset link.')
      }
    } catch (err) {
      setForgotError(getApiErrorMessage(err, 'Failed to send reset request. Verify email or SMTP settings.'))
    }
    setForgotLoading(false)
  }

  const handleWeb3AuthLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const { idToken } = await loginWithWeb3Auth()

      const res = await apiClient.post('/api/auth/web3auth/verify', { idToken })

      if (res.data.success) {
        persistAuthSession({ token: res.data.data.token, user: res.data.data.user })
        navigate('/', { replace: true })
        return
      }
      setError('Web3Auth login failed. Please try again.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Web3Auth sign-in failed.'))
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
        <AuthLeftPane isLogin={true} logoSrc={etherxLogo} />

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
            {isForgotMode ? 'Reset Password' : 'Sign In'}
          </motion.h2>
          
          {!isForgotMode && (
            <motion.p variants={itemVariants} className="auth-form-sub">
              Unlock the full potential of EtherXMeet.
            </motion.p>
          )}

          {!isForgotMode && (
            <>
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

              <motion.div variants={itemVariants} style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  className="auth-social-btn"
                  style={{ width: '100%' }}
                  onClick={handleWeb3AuthLogin}
                  disabled={loading}
                >
                  Continue with Web3Auth
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="auth-divider">
                or use credentials
              </motion.div>
            </>
          )}

          {error && !isForgotMode && (
            <motion.div variants={itemVariants} className="auth-error-box">
              <span>⚠</span> {error}
            </motion.div>
          )}

          <div style={{ position: 'relative', width: '100%' }}>
            <AnimatePresence mode="wait">
              {!isForgotMode ? (
                <motion.div
                  key="login-form-div"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                >
                  <form onSubmit={handleLogin} className="auth-form">
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
                        placeholder="Enter your password"
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

                    <div className="auth-checkbox-row">
                      <label className="auth-checkbox-label">
                        <input
                          type="checkbox"
                          className="auth-checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                        />
                        Remember me
                      </label>
                      <button
                        type="button"
                        className="auth-forgot-link"
                        onClick={() => {
                          setIsForgotMode(true)
                          setError('')
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="auth-cta-btn"
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot-form-div"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                >
                  <p className="auth-form-sub" style={{ marginTop: -15, marginBottom: 20 }}>
                    Enter your email address and we will email you a password reset link.
                  </p>

                  {forgotSuccess && (
                    <motion.div variants={itemVariants} className="auth-success-box">
                      <span>✓</span> {forgotSuccess}
                    </motion.div>
                  )}

                  {forgotError && (
                    <motion.div variants={itemVariants} className="auth-error-box">
                      <span>⚠</span> {forgotError}
                    </motion.div>
                  )}

                  <form onSubmit={handleForgotSubmit} className="auth-form">
                    <div className="auth-input-wrap">
                      <MailIcon />
                      <input
                        className="auth-input"
                        type="email"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="auth-cta-btn"
                    >
                      {forgotLoading ? 'Sending link...' : 'Send reset link'}
                    </button>
                  </form>

                  <button
                    type="button"
                    className="auth-back-btn"
                    onClick={() => {
                      setIsForgotMode(false)
                      setForgotError('')
                      setForgotSuccess('')
                    }}
                  >
                    ← Back to sign in
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isForgotMode && (
            <motion.p variants={itemVariants} className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register" className="auth-footer-link">Register</Link>
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
