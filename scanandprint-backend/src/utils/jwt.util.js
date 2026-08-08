import jwt from 'jsonwebtoken'
import { envConfig } from '../configs/env.config.js'

export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    envConfig.jwtSecret,
    {
      expiresIn: envConfig.jwtExpiresIn,
    })
}

export const verifyToken = (token) => {
  return jwt.verify(token, envConfig.jwtSecret)
}
