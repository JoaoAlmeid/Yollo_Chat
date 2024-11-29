import { Request, Response } from 'express'
import AppError from '../../errors/AppError'
import { Company } from '@prisma/client'
import prisma from '../../prisma/client'
import { verify } from 'jsonwebtoken'
import * as Yup from 'yup'

import CreateCompanyService from 'src/services/company/Create'
import DeleteCompanyService from 'src/services/company/Delete'
import UpdateCompanyService from 'src/services/company/Update'
import ListCompaniesService from 'src/services/company/List'
import UpdateSchedulesService from 'src/services/company/UpdateSchedules'
import FindAllCompanyService from 'src/services/company/FindAll'
import ShowCompanyService from 'src/services/company/Show'
import ShowPlanCompanyService from 'src/services/company/ShowPlan'
import ListCompaniesPlanService from 'src/services/company/ListPlan'
import authConfig from 'src/configs/authConfig'
import { CompanyData, IndexQuery, SchedulesData, TokenPayload } from './types'

const schema = Yup.object().shape({
  name: Yup.string().required(),
  dueDate: Yup.date().required(), 
});

class CompanyController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery

      const { companies, count, hasMore } = await ListCompaniesService({
        searchParam,
        pageNumber,
      })
      return res.json({ companies, count, hasMore })      
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar empresas" })
      throw new AppError(`Ocorreu um erro  ao recuperar empresas: ${error.message}`, 500)
    }
  }
  
  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const newCompany: CompanyData = req.body

      try { await schema.validate(newCompany)} 
      catch (error: any) { throw new AppError(error.message)}

      await CreateCompanyService(newCompany)

      return res.status(200).json(newCompany)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar empresa" })
      throw new AppError(`Ocorreu um erro ao criar empresa: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const companyId = parseInt(id, 10)

      if (isNaN(companyId)) {
        return res.status(400).json({ error: 'Id inválido' })
      }

      const company = await ShowCompanyService(companyId)

      if (!company) {
        throw new AppError('Empresa não encontrada', 404)
      }

      return res.status(200).json(company)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir empresa" })
      throw new AppError(`Ocorreu um erro ao exibir empresa: ${error.message}`, 500)
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const companies: Company[] = await FindAllCompanyService()
      return res.status(200).json(companies)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar empresas" })
      throw new AppError(`Ocorreu um erro ao listar empresas: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const companyData: CompanyData = req.body

      try { await schema.validate(companyData)} 
      catch (error: any) { throw new AppError(error.message)}
      
      const { id } = req.params
      const company = await UpdateCompanyService({ id, ...companyData })

      return res.status(200).json(company)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar empresa" })
      throw new AppError(`Ocorreu um erro ao atualizar empresa: ${error.message}`, 500)
    }
  }

  public async updateSchedules(req: Request, res: Response): Promise<Response> {
    try {
      const { schedules }: SchedulesData = req.body;
      const { id } = req.params

      const company = await UpdateSchedulesService({ id, schedules })

      if (!company) {
        throw new AppError("Empresa não encontrada", 404)
      }
      return res.status(200).json(company)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar agenda da empresa" })
      throw new AppError(`Ocorreu um erro ao atualizar agenda da empresa: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const company = await DeleteCompanyService(id)
      return res.status(204).json(company)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar empresa" })
      throw new AppError(`Ocorreu um erro ao deletar empresa: ${error.message}`, 500)
    }
  }

  public async listPlan(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Autenticação de usuário
      const authHeader = req.headers.authorization
      if (!authHeader) { throw new AppError('Token não fornecido', 401)}

      const [, token] = authHeader.split(' ')
      if (!token) { throw new AppError('Formato do token é inválido', 401)}

      const decoded = verify(token, authConfig.secret) as TokenPayload
      const { id: requestUserId, companyId } = decoded

      const requestUser = await prisma.user.findUnique({ 
        where: { id: Number(requestUserId) } 
      })
      if (!requestUser) { 
        throw new AppError('Usuário não encontrado', 404)
      }

      if (requestUser.super) {
        const company = await ShowPlanCompanyService(Number(id))
        return res.status(200).json(company)
      } else if (companyId.toString() !== id) {
        return res.status(403).json({
          error: 'Você não possui permissão para acessar este recurso!'
        })
      } else {
        const company = await ShowPlanCompanyService(Number(id))
        return res.status(200).json(company)
      }
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar planos da empresa" })
      throw new AppError(`Ocorreu um erro ao listar planos empresa: ${error.message}`, 500)
    }
  }

  public async indexPlan(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.body as IndexQuery

      // Validação de usuário
      const authHeader = req.headers.authorization
      if (!authHeader) {
        throw new AppError('Token não fornecido', 401);
      }

      const [, token] = authHeader.split(' ')
      if (!token) { 
        throw new AppError('Formato do token é inváqlido', 401)
      }
      
      const decoded = verify(token, authConfig.secret) as TokenPayload
      const { id, profile, companyId } = decoded

      const requestUser = await prisma.user.findUnique({ where: { id: Number(id) }})
      if (!requestUser) {
        throw new AppError('Usuário não encontrado', 404);
      }

      if (requestUser.super) {
        const companies = await ListCompaniesPlanService();
        return res.json({ companies });
      } else {
        return res.status(403).json({ error: "Você não possui permissão para acessar este recurso!" });
      }
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar planos da empresa" })
      throw new AppError(`Ocorreu um erro ao listar planos empresa: ${error.message}`, 500)
    }
  }
}

export default new CompanyController()