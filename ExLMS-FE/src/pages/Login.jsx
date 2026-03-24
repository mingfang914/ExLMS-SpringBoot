import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginStart, loginSuccess, loginFailure, setUser } from '../store/authSlice'
import authService from '../services/authService'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    dispatch(loginStart())

    try {
      const data = await authService.login(email, password)
      // 1. Store token so subsequent requests are authenticated
      dispatch(loginSuccess({
        token: data.token,
        refreshToken: data.refreshToken,
        user: data
      }))
      // 2. Fetch full user profile (including persigned avatarUrl from MinIO)
      //    and sync it to Redux so header shows correct avatar/name immediately
      try {
        const profile = await authService.getCurrentUser()
        dispatch(setUser(profile))
      } catch (_) {
        // Non-fatal: header will still show basic info from login response
      }
      navigate('/')
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.'
      setError(message)
      dispatch(loginFailure(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign In to ExLMS
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
