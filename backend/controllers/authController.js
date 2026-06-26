import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// ── Generate JWT ─────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

// ── POST /api/auth/register ──────────────────────────────
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      res.status(400)
      throw new Error('Name, email and password are required')
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400)
      throw new Error('A user with this email already exists')
    }

    const user = await User.create({ name, email, password, role })

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/login ─────────────────────────────────
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400)
      throw new Error('Email and password are required')
    }

    const user = await User.findOne({ email })
    if (!user) {
      res.status(401)
      throw new Error('Invalid email or password')
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      res.status(401)
      throw new Error('Invalid email or password')
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/auth/me ─────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── PUT /api/auth/update ─────────────────────────────────
export const updateCredentials = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)

    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    // Update name
    if (name) user.name = name

    // Update email — check duplicate
    if (email && email !== user.email) {
      const existing = await User.findOne({ email })
      if (existing) {
        res.status(400)
        throw new Error('This email is already taken')
      }
      user.email = email
    }

    // Update password
    if (newPassword) {
      if (!currentPassword) {
        res.status(400)
        throw new Error('Current password is required to set a new password')
      }
      const isMatch = await user.matchPassword(currentPassword)
      if (!isMatch) {
        res.status(401)
        throw new Error('Current password is incorrect')
      }
      user.password = newPassword
    }

    const updatedUser = await user.save()

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      token: generateToken(updatedUser._id),
    })
  } catch (err) {
    next(err)
  }
}