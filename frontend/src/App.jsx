import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Chat from './components/Chat'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')

  if (user) return <Chat user={user} setUser={setUser} />

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8">
      {page === 'login'
        ? <Login setUser={setUser} setPage={setPage} />
        : <Register setUser={setUser} setPage={setPage} />
      }
    </div>
  )
}