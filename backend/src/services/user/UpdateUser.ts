import * as Yup from "yup";
import AppError from "../../errors/AppError";
import prisma from "../../prisma/client";
import bcrypt from "bcrypt"
import { RequestUpUser, ResponseUpUser } from "src/@types/User";

const UpdateUserService = async ({
  userData,
  userId,
  companyId,
  requestUserId
}: RequestUpUser): Promise<ResponseUpUser | undefined> => {
  // Buscar o usuário para atualizar
  const user = await prisma.user.findUnique({
    where: { id: +userId }
  });

  if (!user) { throw new AppError("Usuário não encontrado", 404) }

  // Buscar o usuário que está fazendo a solicitação
  const requestUser = await prisma.user.findUnique({
    where: { id: requestUserId }
  });

  if (!requestUser) { throw new AppError("Usuário solicitante não encontrado", 404) }
  
  // Verifica as permissões
  if (!requestUser.super && userData.companyId !== companyId) {
    throw new AppError("O usuário não pertence à esta empresa", 500);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    email: Yup.string().email(),
    profile: Yup.string(),
    password: Yup.string()
  });

  const { email, password, profile, name, queueIds = [], whatsappId } = userData;

  try {
    await schema.validate({ email, password, profile, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Atualiza o usuário
  const updatedUser = await prisma.user.update({
    where: { id: +userId },
    data: {
      email,
      passwordHash: password ? await bcrypt.hash(password, 10) : user.passwordHash,
      profile,
      name,
      whatsappId: whatsappId || null,
      queues: { set: queueIds.map(id => ({ id })) }
    }

  });

  // Busca a empresa e as filas associadas
  const company = await prisma.company.findUnique({
    where: { id: user.companyId }
  })

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    profile: updatedUser.profile
  }
};

export default UpdateUserService;
