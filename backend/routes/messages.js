import express from 'express'
import { getMessages, sendMessage, markAsRead } from '../controllers/messageController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.get('/:userId', protect, getMessages)
router.post('/', protect, sendMessage)
router.put('/read/:userId', protect, markAsRead)

export default router