import * as Yup from "yup";
import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import prisma from "../../prisma/client";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { ReqUser, ResUser } from "src/@types/User";

const CreateUserService = async ({
  email,
  password,
  name,
  queueIds = [],
  companyId,
  profile = "admin",
  whatsappId
}: ReqUser): Promise<ResUser> => {
  // Validação de limite de usuários
  if (companyId !== undefined) {
    const company = await prisma.company.findUnique({ 
      where: { id: companyId },
      include: {
        plan: true
      }
    });

    if (company) {
      const usersCount = await prisma.user.count({ where: { companyId } });

      if (usersCount >= company.plan.users) {
        throw new AppError(`Número máximo de usuários já alcançado: ${usersCount}`);
      }
    }
  }

  // Validação de dados
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    email: Yup.string()
      .email()
      .required()
      .test(
        "Check-email",
        "Um usuário com este email já existe.",
        async value => {
          if (!value) return false;
          const emailExists = await prisma.user.findUnique({
            where: { email: value }
          });
          return !emailExists;
        }
      ),
    password: Yup.string().required().min(5)
  });

  try {
    await schema.validate({ email, password, name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userData: Prisma.UserCreateInput = {
    email,
    passwordHash,
    name,
    profile,
    ...(whatsappId !== undefined && { whatsapp: { connect: { id: whatsappId } } }),
    ...(companyId !== undefined && { company: { connect: { id: companyId } } }),
    super: false,
    online: false
  };

  const user = await prisma.user.create({
    data: userData
  });

  if (queueIds.length > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        queues: { 
          connect: queueIds.map(id => ({ id })) 
        } 
      }
    });
  }

  const serializedUser = await SerializeUser(user);
  return serializedUser;
};

export default CreateUserService;