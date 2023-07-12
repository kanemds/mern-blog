const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const loginUser = User.find({ username }).exec()

  if (!loginUser || !loginUser.active) {
    return res.status(401).json({ message: 'User is not authorized' })
  }

  const isPasswordMatch = await bcrypt.compare(password, loginUser.password)

  if (!isPasswordMatch) return res.status(401).json({ message: 'User is not authorized' })

  const accessToken = jwt.sign({
    'userInfo': {
      'username': loginUser.username,
      'role': loginUser.role
    }
  },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '10s'
    }
  )

  // user is not required to login if the while the refresh token is validate
  const refreshToken = jwt.sign({
    'username': loginUser.username
  },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  )

  res.cookie('jwt', refreshToken, {
    httpOnly: true, // accessibly only by web server
    secure: true, // https only
    sameSite: 'None', // cross-site cookie
    maxAge: 1000 * 60 * 60 * 24 * 1
  })
    %
    res.status(200).json({ accessToken })

})

// @desc Refresh
// @route GET /auth/refresh
// @access Public send new accessToken when it is expired
const refresh = asyncHandler(async (req, res) => {

})


// @desc Logout
// @route POST /auth/logout
// @access Public clear cookie if exists
const logout = asyncHandler(async (req, res) => {

})

module.exports = { login, refresh, logout }