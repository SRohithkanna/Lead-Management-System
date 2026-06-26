import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
  try {
    let token

    // Check Authorization header first
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    // Fallback — check query param (used for CSV/PDF export via window.open)
    if (!token && req.query.token) {
      token = req.query.token
    }

    if (!token) {
      res.status(401)
      throw new Error('Not authorized, no token')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      res.status(401)
      throw new Error('User not found')
    }

    next()
  } catch (err) {
    next(err)
  }
}

export default protect