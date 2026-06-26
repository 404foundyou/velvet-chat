import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import messageRoutes from './routes/messages.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)

// Online users map
const onlineUsers = new Map()

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id)
    io.emit('online_users', Array.from(onlineUsers.keys()))
  })

  socket.on('send_message', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver)
    if (receiverSocket) {
      io.to(receiverSocket).emit('receive_message', data)
    }
  })

  socket.on('typing', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver)
    if (receiverSocket) {
      io.to(receiverSocket).emit('typing', data)
    }
  })

  socket.on('stop_typing', (data) => {
    const receiverSocket = onlineUsers.get(data.receiver)
    if (receiverSocket) {
      io.to(receiverSocket).emit('stop_typing', data)
    }
  })

  socket.on('disconnect', () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        onlineUsers.delete(userId)
      }
    })
    io.emit('online_users', Array.from(onlineUsers.keys()))
    console.log('User disconnected:', socket.id)
  })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!')
    httpServer.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => console.log(err))