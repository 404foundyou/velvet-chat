import { useState } from 'react'
import axios from 'axios'

export default function Login({ setUser, setPage }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('https://velvet-chat-2.onrender.com/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-6 sm:px-8 py-8 sm:py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">V</span>
        </div>
        <span className="text-xl font-semibold text-gray-800">Velvet</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
      <p className="text-gray-500 text-sm mb-6">Sign in to continue your conversations</p>
      {error && (
        <p className="text-red-500 text-xs mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
      <div className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-colors placeholder-gray-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-colors placeholder-gray-400"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 mt-1
            ${loading
              ? 'bg-indigo-300 text-white cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95'
            }`}
        >
          {loading ? 'Signing in...' : 'Log in'}
        </button>
      </div>
      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <button
          onClick={() => setPage('register')}
          className="text-indigo-500 font-medium hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  )
}