import express from 'express'
import {
  registerUser,
  loginUser,
  getMe,
  updateCredentials,
} from '../controllers/authController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login',    loginUser)
router.get('/me',        protect, getMe)
router.put('/update',    protect, updateCredentials)

export default router