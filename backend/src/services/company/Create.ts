import { Company } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import bcrypt from 'bcrypt'
import { CompanyData } from './types'
import validateCompanySchema from './validation'

const CreateCompanyService = async ( companyData: CompanyData ): Promise<Company> => {
  try {
    const { name, phone, email, status, planId, password, campaignsEnabled, dueDate, recurrence } = companyData
  
    // Validação dos dados da empresa
    await validateCompanySchema({ name })
    
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined
    
    // Criação da empresa
    const company = await prisma.company.create({
      data: {
        name,
        phone,
        email,
        status,
        planId,
        dueDate,
        recurrence
      },
    })

    // Criação do admin da empresa, caso tenha senha
    if (hashedPassword) {
      await prisma.user.create({
        data: {
          name: company.name,
          email: company.email!,
          passwordHash: hashedPassword,
          profile: 'admin',
          super: true,
          online: false,
          companyId: company.id,
          updatedAt: new Date(),
        },
      })
    }
  
    // Dados das configurações padrôes
    const settingsData = [
      { key: 'asaas', value: '' },
      { key: 'tokenixc', value: '' },
      { key: 'ipixc', value: '' },
      { key: 'ipmkauth', value: '' },
      { key: 'clientsecretmkauth', value: '' },
      { key: 'clientidmkauth', value: '' },
      { key: 'CheckMsgIsGroup', value: '' },
      { key: 'call', value: 'disabled' },
      { key: 'scheduleType', value: 'disabled' },
      { key: 'sendGreetingAccepted', value: 'disabled' },
      { key: 'sendMsgTransfTicket', value: 'disabled' },
      { key: 'userRating', value: 'disabled' },
      { key: 'chatBotType', value: 'text' },
      { key: 'tokensgp', value: '' },
      { key: 'ipsgp', value: '' },
      { key: 'appsgp', value: '' },
    ]

    // Inserção ou atualização das configurações no banco
    for (const setting of settingsData) {
      await prisma.setting.upsert({
        where: {
          companyId_key: {
            companyId: company.id,
            key: setting.key,
          }
        },
        update: {
          value: setting.value,
          updatedAt: new Date(),
        },
        create: {
          companyId: company.id,
          key: setting.key,
          value: setting.value,
          updatedAt: new Date(),
        },
      })
    }
  
    // Caso campanhas estejam habilitadas, salvar essa configuração
    if (campaignsEnabled !== undefined) {
      await prisma.setting.upsert({
        where: {
          companyId_key: {
            companyId: company.id,
            key: 'campaignsEnabled',
          },
        },
        update: {
          value: `${campaignsEnabled}`,
          updatedAt: new Date(),
        },
        create: {
          companyId: company.id,
          key: 'campaignsEnabled',
          value: `${campaignsEnabled}`,
          updatedAt: new Date(),
        },
      })
    }
  
    return company
  } catch (error) {
    console.error(`Erro ao criar empresa: ${error.message}`) 
    throw new AppError(`Erro interno ao criar empresa: ${error.message}`, 500)
  }
}

export default CreateCompanyService