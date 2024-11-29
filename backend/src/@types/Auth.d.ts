import { Request } from 'express'

export interface TokenPayload {
  id: string | number
  username: string
  profile: string
  companyId: number
  iat: number
  exp: number
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string | number
    profile: string
    companyId: number
  }
  whatsappId?: string
}

export interface LoginCredentials {
  userId: string
  companyId: number
}

export interface RefreshTokenPayload {
  id: string
  tokenVersion: number
  companyId: number
}

export interface UserDTO {
  id: number
  name: string
  email: string
  tokenVersion: number
  profile: string
  super: boolean
  companyId: number
  company?: {
    id: number
    name: string
  }
  queues?: {
    id: number
    name: string
    color: string
  }[]
}
