import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Chat from './components/Chat'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')

  console.log('user:', user)

  if (user) return <Chat user={user} setUser={setUser} />

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      {page === 'login'
        ? <Login setUser={setUser} setPage={setPage} />
        : <Register setUser={setUser} setPage={setPage} />
      }
    </div>
  )
}