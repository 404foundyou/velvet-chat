import express from 'express'
import { getAllUsers, searchUsers } from '../controllers/userController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, getAllUsers)
router.get('/search', protect, searchUsers)

export default router