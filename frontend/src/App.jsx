import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Chat from './components/Chat'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')

  // Restore user from localStorage on page refresh
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Save user to localStorage when it changes
  const handleSetUser = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
    setUser(userData)
  }

  if (user) return <Chat user={user} setUser={handleSetUser} />

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8">
      {page === 'login'
        ? <Login setUser={handleSetUser} setPage={setPage} />
        : <Register setUser={handleSetUser} setPage={setPage} />
      }
    </div>
  )
}