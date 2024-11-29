import prisma from "../../prisma/client"
import AppError from "../../errors/AppError"
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens"
import { Queue } from "@prisma/client"
import bcrypt from 'bcryptjs'
import { SerializeUser } from "src/helpers/SerializeUser"

interface SerializedUser {
  id: number
  name: string
  email: string
  profile: string
  queues: Queue[]
  companyId: number
}

interface Request {
  email: string
  password: string
}

interface Response {
  serializedUser: SerializedUser
  token: string
  refreshToken: string
}

const AuthUserService = async ({ email, password }: Request): Promise<Response> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      queues: true,
      company: {
        include: {
          settings: true
        }
      }
    }
  })

  if (!user) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401)
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401)
  }

  const token = createAccessToken(user)
  const refreshToken = createRefreshToken(user)
  const serializedUser = await SerializeUser(user)

  return { serializedUser, token, refreshToken }
}

export default AuthUserService
