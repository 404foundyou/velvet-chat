import User from '../models/User.js'
import mongoose from 'mongoose'

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: new mongoose.Types.ObjectId(req.user.id) } })
      .select('-password')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query
    const users = await User.find({
      _id: { $ne: new mongoose.Types.ObjectId(req.user.id) },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).select('-password')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}