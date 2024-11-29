import {
  getCustomer,
  getPayments,
  getPixQrCode,
  getIdentificationField,
} from './consultarAsaasClient'
import {
  notifyProcessing,
  notifyCustomerNotFound,
  notifyNoOverduePayments,
  notifyInvoice,
  notifyPixAndBarcode,
} from '../utils/whatsappUtils'
import UpdateTicketService from '../../../../services/tickets/UpdateTicket'
import { WASocket } from '@whiskeysockets/baileys'
import { Contact, Ticket } from '@prisma/client'
import { validaCpfCnpj } from '../../messageListener/validate/ValidarCpfCnpj'
import { sendWhatsAppMessage } from '../utils/sendMessage'
import { sleep } from '../utils/sleep'

const isNumeric = (value: string) => /^-?\d+$/.test(value)

// Função auxiliar para ordenar pagamentos por data de vencimento
const sortPaymentsByDueDate = (payments: any[]) => {
  return payments.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export const clienteAsaas = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket,
  asaastk: string,
  numberCPFCNPJ: string
) => {
  if (!asaastk) return

  if (isNumeric(numberCPFCNPJ) && numberCPFCNPJ.length > 2) {
    const isCPFCNPJ = validaCpfCnpj(numberCPFCNPJ)
    if (isCPFCNPJ) {
      await notifyProcessing(wbot, contact, ticket)

      try {
        const customerData = await getCustomer(numberCPFCNPJ, asaastk)
        const { data: customers, totalCount } = customerData

        if (totalCount === 0) {
          await notifyCustomerNotFound(wbot, contact, ticket)
        } else {
          const customer = customers[0]
          const { name: nome, id: id_cliente } = customer

          await sendWhatsAppMessage(
            wbot,
            contact,
            ticket,
            `Localizei seu Cadastro! \n*${nome}* só mais um instante por favor!`
          )
          await sleep(2000)

          const overduePayments = await getPayments(
            id_cliente,
            'OVERDUE',
            asaastk
          )
          let paymentsToProcess = overduePayments.data

          if (overduePayments.totalCount === 0) {
            await notifyNoOverduePayments(wbot, contact, ticket)
            await sleep(2000)

            const pendingPayments = await getPayments(
              id_cliente,
              'PENDING',
              asaastk
            )
            paymentsToProcess = sortPaymentsByDueDate(pendingPayments.data)
          } else {
            paymentsToProcess = sortPaymentsByDueDate(overduePayments.data)
          }

          const payment = paymentsToProcess[0]

          await notifyInvoice(wbot, contact, ticket, payment, nome)

          const pixData = await getPixQrCode(payment.id, asaastk)
          if (pixData.success) {
            const barcodeData = await getIdentificationField(
              payment.id,
              asaastk
            )
            await notifyPixAndBarcode(
              wbot,
              contact,
              ticket,
              pixData,
              barcodeData
            )
          }

          await sleep(2000)

          try {
            await UpdateTicketService({
              ticketData: { status: 'closed' },
              ticketId: ticket.id,
              companyId: ticket.companyId,
            })
          } catch (updateError) {
            console.error('Erro ao atualizar o ticket:', updateError)
          }
        }
      } catch (error: any) {
        console.error('Erro ao processar cliente:', error)
        await sendWhatsAppMessage(
          wbot,
          contact,
          ticket,
          `*Opss!!!!*\nOcorreu um erro! Digite *#* e fale com um *Atendente*!`
        )
      }
    }
  }
}
