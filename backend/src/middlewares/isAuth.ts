import { verify } from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { logger } from '../utils/Logger';
import AppError from '../errors/AppError';
import authConfig from '../configs/authConfig';
import { AuthenticatedRequest, TokenPayload } from 'src/@types/Auth';

const isAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.error('Sem cabeçalho de autenticação');
    throw new AppError('Sessão Expirada!', 401);
  }
  const [, token] = authHeader.split(' ');
  if (!token) {
    logger.error('Token está faltando no cabeçalho de autenticação');
    throw new AppError('Sessão Expirada!', 401);
  }
  try {
    const decoded = verify(token, authConfig.secret) as TokenPayload
    const { id, profile, companyId } = decoded
    req.user = { id, profile, companyId }
    next();
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Verificação de token: ${err.message}`);
    } else {
      logger.error('Verificação de token: Erro desconhecido');
    }
    throw new AppError(
      'Token inválido. Tentaremos atribuir outro na próxima solicitação!',
      403
    );
  }
};

export default isAuth