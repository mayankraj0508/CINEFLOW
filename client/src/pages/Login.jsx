import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Login = () => {
  const { login, user, authLoading } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirectTo, { replace: true })
    }
  }, [authLoading, user, navigate, redirectTo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex justify-center items-center px-6 pt-24'>
      <form onSubmit={handleSubmit} className='w-full max-w-md bg-primary/10 border border-primary/20 rounded-lg p-8 space-y-5'>
        <h1 className='text-2xl font-semibold text-center'>Login</h1>
        <p className='text-sm text-gray-400 text-center'>Welcome back to QuickShow</p>

        <div className='space-y-1'>
          <label className='text-sm text-gray-300'>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-4 py-2.5 rounded-md bg-black/40 border border-gray-700 outline-none focus:border-primary'
            placeholder='Enter your email'
          />
        </div>

        <div className='space-y-1'>
          <label className='text-sm text-gray-300'>Password</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full px-4 py-2.5 rounded-md bg-black/40 border border-gray-700 outline-none focus:border-primary'
            placeholder='Enter your password'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full py-2.5 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer disabled:opacity-60'
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className='text-sm text-center text-gray-400'>
          Don&apos;t have an account?{' '}
          <Link to='/register' state={{ from: redirectTo }} className='text-primary hover:underline'>
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login
