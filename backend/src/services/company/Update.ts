import { Company } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { CompanyData } from './types'

const UpdateCompany = async (companyData: CompanyData): Promise<Company> => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: Number(companyData.id) }
    })
    const { id, name, phone, email, status, planId, campaignsEnabled, dueDate, recurrence } = companyData
  
    if (!company) {
      throw new AppError('Erro: Empresa não encontrada', 400)
    }
  
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        name,
        phone,
        email,
        status,
        planId,
        dueDate,
        recurrence,
      },
    })
    if (campaignsEnabled !== undefined) {
      const existingSetting = await prisma.setting.findFirst({
        where: { 
          companyId: company.id, 
          key: 'campaignsEnabled' 
        }
      })
  
      if (existingSetting) {
        await prisma.setting.update({
          where: { id: existingSetting.id },
          data: { value: `${campaignsEnabled}` },
        })
      } else {
        await prisma.setting.create({
          data: {
            companyId: company.id,
            key: 'campaignsEnabled',
            value: `${campaignsEnabled}`,
            updatedAt: new Date(),
          },
        })
      }
    }
    return updatedCompany
  } catch (error) {
    
  }
}

export default UpdateCompany