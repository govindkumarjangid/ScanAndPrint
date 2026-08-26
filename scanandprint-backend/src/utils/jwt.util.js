import jwt from 'jsonwebtoken'
import { envConfig } from '../configs/env.config.js'

export const generateToken = (payload, expiresIn) => {
  return jwt.sign(
    payload,
    envConfig.jwtSecret,
    {
      expiresIn: expiresIn || envConfig.jwtExpiresIn || '7d',
    })
}

export const verifyToken = (token) => {
  return jwt.verify(token, envConfig.jwtSecret)
}
