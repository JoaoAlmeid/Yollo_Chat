import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  })
}

export const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  })
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error: any) {
    throw new Error('Token inválido')
  }
}

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch (error: any) {
    throw new Error('Refresh token inválido')
  }
}
