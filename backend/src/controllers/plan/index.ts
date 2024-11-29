import * as Yup from 'yup'
import { Request, Response } from 'express'
import CreatePlan from '../../services/plan/CreatePlan'
import DeletePlan from '../../services/plan/DeletePlan'
import FindAllPlan from '../../services/plan/FindAllPlan'
import ListPlans from '../../services/plan/ListPlans'
import ShowPlan from '../../services/plan/ShowPlan'
import UpdatePlan from '../../services/plan/UpdatePlan'
import AppError from '../../errors/AppError'
import { Plan } from '@prisma/client'
import { IndexQuery, StorePlanData, UpdatePlanData } from './types'

class PlanController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery

      const { plans, count, hasMore } = await ListPlans({
        searchParam,
        pageNumber
      })
      return res.status(200).json({ plans, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar planos" })
      throw new AppError(`Ocorreu um erro ao recuperar planos: ${error.message}`, 500)
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const plans: Plan[] = await FindAllPlan()
      return res.status(200).json(plans)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar planos" })
      throw new AppError(`Ocorreu um erro ao listar planos: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const newPlan: StorePlanData = req.body
  
      const schema = Yup.object().shape({
        name: Yup.string().required('Nome é obrigatório')
      })

      try {
        await schema.validate(newPlan)
      } catch (error: any) {
        throw new AppError(error.message)
      }

      const plan = await CreatePlan(newPlan)
      return res.status(200).json(plan)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar plano" })
      throw new AppError(`Ocorreu um erro ao criar plano: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    try {
      await DeletePlan(Number(id))
      return res.status(200).json({
        message: "Plano deletado com sucesso"
      })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar plano" })
      throw new AppError(`Ocorreu um erro ao deletar plano: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    try {
      const plan = await ShowPlan(Number(id))
      return res.status(200).json(plan)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir plano" })
      throw new AppError(`Ocorreu um erro ao exibir plano: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const planData: UpdatePlanData = req.body
      const schema = Yup.object().shape({
        name: Yup.string()
      })

      const plan = await UpdatePlan(planData)
      return res.status(200).json(plan)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar plano" })
      throw new AppError(`Ocorreu um erro ao atualizar plano: ${error.message}`, 500)
    }
  }
}

export default new PlanController()