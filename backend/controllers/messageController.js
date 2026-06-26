import Message from '../models/Message.js'

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body
    const message = await Message.create({
      sender: req.user.id,
      receiver,
      content,
    })
    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}

export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params
    await Message.updateMany(
      { sender: userId, receiver: req.user.id, isRead: false },
      { isRead: true }
    )
    res.json({ message: 'Messages marked as read.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}