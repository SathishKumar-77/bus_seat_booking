const jwt = require('jsonwebtoken')
const prisma = require('../prisma/prisma')

const protect = (roles = []) => async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from database (excluding password)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true
        }
      })

      if (!user) {
        return res.status(401).json({ message: 'Not authorized' })
      }

      // Check if user has required role
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Not authorized for this action' })
      }

      // Attach user to request object
      req.user = user
      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

module.exports = { protect }