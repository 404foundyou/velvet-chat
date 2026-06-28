import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import io from 'socket.io-client'

const socket = io('https://velvet-chat-2.onrender.com')

export default function Chat({ user, setUser }) {
  const [contacts, setContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    socket.emit('user_online', user.id)
    socket.on('online_users', (users) => setOnlineUsers(users))
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })
    socket.on('typing', (data) => {
      if (data.sender === selectedContact?._id) setIsTyping(true)
    })
    socket.on('stop_typing', (data) => {
      if (data.sender === selectedContact?._id) setIsTyping(false)
    })
    return () => {
      socket.off('online_users')
      socket.off('receive_message')
      socket.off('typing')
      socket.off('stop_typing')
    }
  }, [selectedContact])

  useEffect(() => {
    if (selectedContact) {
      const token = localStorage.getItem('token')
      axios.get(`https://velvet-chat-2.onrender.com/api/messages/${selectedContact._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => setMessages(res.data))
    }
  }, [selectedContact])

  const handleSearch = async (e) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.trim() === '') return setSearchResults([])
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`https://velvet-chat-2.onrender.com/api/users/search?query=${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSearchResults(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleSelectContact = (contact) => {
    setSelectedContact(contact)
    setSearchQuery('')
    setSearchResults([])
    if (!contacts.find((c) => c._id === contact._id)) {
      setContacts((prev) => [contact, ...prev])
    }
    // On mobile, hide sidebar when contact is selected
    if (window.innerWidth < 768) {
      setShowSidebar(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    const msgContent = newMessage
    setNewMessage('') // clear input instantly
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('https://velvet-chat-2.onrender.com/api/messages', {
        receiver: selectedContact._id,
        content: msgContent,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setMessages((prev) => [...prev, res.data])
      socket.emit('send_message', { ...res.data, receiver: selectedContact._id })
      socket.emit('stop_typing', { sender: user.id, receiver: selectedContact._id })
    } catch (err) {
      console.log(err)
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    socket.emit('typing', { sender: user.id, receiver: selectedContact?._id })
    if (typingTimeout) clearTimeout(typingTimeout)
    setTypingTimeout(setTimeout(() => {
      socket.emit('stop_typing', { sender: user.id, receiver: selectedContact?._id })
    }, 1500))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const handleBackToContacts = () => {
    setShowSidebar(true)
    setSelectedContact(null)
  }

  const isMine = (msg) => {
    return String(msg.sender) === String(user.id)
  }

  return (
    <div className="h-screen flex bg-white relative overflow-hidden">

      {/* Sidebar */}
      <div className={`
        flex-shrink-0 w-80 border-r border-gray-100 flex flex-col
        md:relative md:flex md:w-80
        absolute inset-y-0 left-0 z-20 bg-white
        transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">V</span>
            </div>
            <span className="font-semibold text-gray-800">Velvet</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
            Logout
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100 relative">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search contacts"
              value={searchQuery}
              onChange={handleSearch}
              className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute left-4 right-4 top-14 bg-white border border-gray-100 rounded-xl shadow-lg z-10">
              {searchResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleSelectContact(u)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-500 text-sm font-medium">{u.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-500 font-medium text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-green-500">● Online</p>
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400 px-4 py-2 tracking-widest uppercase">Messages</p>
          {contacts.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-8 text-center">No contacts yet. Search to find people!</p>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => handleSelectContact(contact)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors
                  ${selectedContact?._id === contact._id ? 'bg-indigo-50' : ''}`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-500 font-medium">{contact.name.charAt(0)}</span>
                  </div>
                  {onlineUsers.includes(contact._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{contact.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {onlineUsers.includes(contact._id) ? '● Online' : '○ Offline'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Deepika Watermark */}
        <div className="px-4 py-3 select-none pointer-events-none">
          <span style={{
            fontFamily: "'Pinyon Script', 'Dancing Script', 'Great Vibes', cursive",
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
            display: 'inline-block',
            opacity: 0.75,
          }}>
            Deepika
          </span>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {showSidebar && selectedContact && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-10"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Chat Window */}
      <div className={`
        flex-1 flex flex-col min-w-0
        ${!showSidebar ? 'flex' : 'hidden md:flex'}
      `}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              {/* Back button on mobile */}
              <button
                onClick={handleBackToContacts}
                className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 -ml-1 mr-1"
              >
                ←
              </button>
              <div className="relative">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-500 font-medium">{selectedContact.name.charAt(0)}</span>
                </div>
                {onlineUsers.includes(selectedContact._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">{selectedContact.name}</p>
                <p className="text-xs text-gray-400">
                  {isTyping ? '✍️ Typing...' : onlineUsers.includes(selectedContact._id) ? '● Online' : '○ Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${isMine(msg) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] md:max-w-xs px-4 py-2 rounded-2xl text-sm
                    ${isMine(msg)
                      ? 'bg-indigo-500 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                    {msg.content}
                    <div className={`text-xs mt-1 ${isMine(msg) ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMine(msg) && (
                        <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-4 md:px-6 py-4 border-t border-gray-100 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-gray-50 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors active:scale-95 flex-shrink-0"
              >
                <span className="text-white text-sm">→</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-700">Your Messages</h3>
            <p className="text-sm text-gray-400 text-center max-w-xs">
              Select a conversation or search for someone to start chatting
            </p>
            {/* Show contacts button on mobile when no chat selected */}
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden mt-2 px-5 py-2.5 bg-indigo-500 text-white text-sm rounded-full hover:bg-indigo-600 transition-colors"
            >
              View Contacts
            </button>
          </div>
        )}
      </div>

      {/* Google Fonts for cursive */}
      <link
        href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Dancing+Script:wght@700&display=swap"
        rel="stylesheet"
      />
    </div>
  )
}
