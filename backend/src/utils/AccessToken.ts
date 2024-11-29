import jwt from 'jsonwebtoken'
import authConfig from '../configs/authConfig'

interface TokenPayload {
  userId: string
  companyId: number
  tokenVersion?: number
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, authConfig.secret, {
    expiresIn: authConfig.expiresIn,
  })
}

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, authConfig.refreshSecret, {
    expiresIn: authConfig.refreshExpiresIn,
  })
}

export const verifyToken = (
  token: string,
  secret: string
): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload
    return decoded
  } catch (err) {
    return null
  }
}
