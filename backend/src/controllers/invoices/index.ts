import * as Yup from 'yup'
import { Request, Response } from 'express'
import FindAllInvoice from '../../services/invoice/FindAll'
import ListInvoices from '../../services/invoice/List'
import ShowInvoice from '../../services/invoice/Show'
import UpdateInvoice from '../../services/invoice/Update'
import AppError from 'src/errors/AppError'
import { Invoice } from '@prisma/client'
import { IndexQuery, UpdateInvoiceData } from './types'

const schema = Yup.object().shape({
  status: Yup.string().required("Status é obrigatório")
})

class InvoiceController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery
  
      const { invoices, count, hasMore } = await ListInvoices({
        searchParam,
        pageNumber,
      })
  
      return res.status(200).json({ invoices, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperas faturas" })
      throw new AppError(`Ocorreu um erro ao recuperas faturas: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { Invoiceid } = req.params
      const invoice = await ShowInvoice(Invoiceid)
      return res.status(200).json(invoice)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir fatura" })
      throw new AppError(`Ocorreu um erro ao exibir fatura: ${error.message}`, 500)
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.query
      const invoice: Invoice[] = await FindAllInvoice({companyId: Number(companyId) })
      return res.status(200).json(invoice)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar faturas" })
      throw new AppError(`Ocorreu um erro ao listar faturas: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const InvoiceData: UpdateInvoiceData = req.body
      
      try { await schema.validate(InvoiceData)} 
      catch (error: any) { throw new AppError(error.message)}

      const { id, status } = InvoiceData
      const invoice = await UpdateInvoice({
        id,
        status
      })

      return res.status(200).json(invoice)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar fatura" })
      throw new AppError(`Ocorreu um erro ao atualizar fatura: ${error.message}`, 500)
    }
  }
}

export default new InvoiceController()