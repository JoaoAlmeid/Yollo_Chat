import { verify } from 'jsonwebtoken'
import ShowUser from '../user/ShowUser'
import authConfig from '../../configs/authConfig'
import { RefreshTokenPayload, UserDTO } from '../../@types/Auth'

export default async function FindUserFromToken(
  token: string
): Promise<UserDTO> {
  try {
    const decoded = verify( token, authConfig.refreshSecret ) as RefreshTokenPayload
    const { id } = decoded
    const user = await ShowUser(id)

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Crie o objeto userDTO com base no tipo UserDTO
    const userDTO: UserDTO = {
      id: user.id,
      name: user.name,
      email: user.email,
      tokenVersion: user.tokenVersion,
      profile: user.profile,
      super: user.super,
      companyId: user.companyId,
      company: undefined,
      queues: undefined,
    }

    return userDTO
  } catch (error: any) {
    if (error instanceof Error) {
      throw new Error(
        'Erro ao verificar o token ou buscar o usuário: ' + error.message
      )
    }
    throw new Error('Erro desconhecido')
  }
}
