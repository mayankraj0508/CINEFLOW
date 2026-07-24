import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Register = () => {
  const { register, login, user, authLoading } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirectTo, { replace: true })
    }
  }, [authLoading, user, navigate, redirectTo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!avatar) {
      return toast.error('Avatar image is required')
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', name)
      formData.append('username', username)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('avatar', avatar)

      await register(formData)
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex justify-center items-center px-6 py-10 pt-28'>
      <form onSubmit={handleSubmit} className='w-full max-w-md bg-primary/10 border border-primary/20 rounded-lg p-8 space-y-5'>
        <h1 className='text-2xl font-semibold text-center'>Register</h1>
        <p className='text-sm text-gray-400 text-center'>Create your QuickShow account</p>

        <div className='space-y-1'>
          <label className='text-sm text-gray-300'>Full Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className='w-full px-4 py-2.5 rounded-md bg-black/40 border border-gray-700 outline-none focus:border-primary'
            placeholder='Enter your name'
          />
        </div>

        <div className='space-y-1'>
          <label className='text-sm text-gray-300'>Username</label>
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className='w-full px-4 py-2.5 rounded-md bg-black/40 border border-gray-700 outline-none focus:border-primary'
            placeholder='Choose a username'
          />
        </div>

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
            placeholder='Create a password'
          />
        </div>

        <div className='space-y-1'>
          <label className='text-sm text-gray-300'>Avatar</label>
          <input
            type='file'
            accept='image/*'
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            required
            className='w-full px-4 py-2.5 rounded-md bg-black/40 border border-gray-700 outline-none focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary file:text-white file:cursor-pointer'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full py-2.5 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer disabled:opacity-60'
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className='text-sm text-center text-gray-400'>
          Already have an account?{' '}
          <Link to='/login' state={{ from: redirectTo }} className='text-primary hover:underline'>
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register
