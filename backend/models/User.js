import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, default: 'Hey there! I am using Velvet.' },
  avatar: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('User', userSchema)