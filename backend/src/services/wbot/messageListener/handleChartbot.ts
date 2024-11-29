import { Ticket, Contact, Queue, QueueOption } from '@prisma/client'
import { WAMessage } from '@whiskeysockets/baileys'
import formatBody from '../../../helpers/Mustache'
import getBodyMessage from './get/getBodyMessage'
import verifyQueue from './verify/verifyQueue'
import prisma from '../../../prisma/client'
import { isNil } from 'lodash'
import verifyMessage from './verify/verifyMessage'
import { Session } from '../../../@types/Session'
import AppError from '../../../errors/AppError'

type QueueWithOptions = Queue & {
  options: QueueOption[]
}

export type TicketWithRelations = Ticket & {
  contact: Contact
  queue: QueueWithOptions | null
}

const handleChartbot = async (ticket: Ticket, msg: WAMessage, wbot: Session, dontReadTheFirstQuestion: boolean = false) => {
  const contact = await prisma.contact.findUnique({ where: { id: ticket.id } })
  if (!contact) { throw new AppError('Contato não encontrado!') }

  if (ticket.queueId == null) {
    throw new Error('Id da fila é nulo.')
  }

  const queue = await prisma.queue.findUnique({
    where: { id: ticket.queueId },
    include: {
      options: {
        where: { parentId: null },
        orderBy: [
          { option: 'asc' },
          { createdAt: 'asc' }
        ],
      }
    }
  })

  const messageBody = getBodyMessage(msg)

  if (messageBody == '#') {
    // Voltar para o menu inicial
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { 
        queueOptionId: undefined, 
        chatbot: false, 
        queueId: undefined 
      }
    })
    await verifyQueue(wbot, msg, ticket, contact)
    return
  }

  // Volta para o menu anterior
  if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == '0') {
    const option = await prisma.queueOption.findUnique({ where: { id: ticket.queueOptionId } })
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { queueOptionId: option?.parentId },
    })

    // Escolha uma opção
  } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
    const count = await prisma.queueOption.count({
      where: { parentId: ticket.queueOptionId },
    })
    let option: any = {}
    if (count == 1) {
      option = await prisma.queueOption.findFirst({
        where: { parentId: ticket.queueOptionId },
      })
    } else {
      option = await prisma.queueOption.findFirst({
        where: {
          option: messageBody || '',
          parentId: ticket.queueOptionId,
        },
      })
    }
    if (option) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { queueOptionId: option?.id},
      })
    }
  } else if (!isNil(queue) && isNil(ticket.queueOptionId) && !dontReadTheFirstQuestion) {
    const option = queue?.options.find(o => o.option == messageBody)
    if (option) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { queueOptionId: option?.id },
      })
    }
  }

  const updatedTicket = await prisma.ticket.findUnique({
    where: { id: ticket.id },
    include: { queue: true, contact: true },
  })

  if (!updatedTicket) {
    throw new AppError('Ticket não encontrado!', 404)
  }

  if (!isNil(queue) && isNil(updatedTicket.queueOptionId)) {
    const queueOptions = await prisma.queueOption.findMany({
      where: { queueId: ticket.queueId, parentId: null },
      orderBy: [{ option: 'asc' }, { createdAt: 'asc' }],
    })

    const companyId = ticket.companyId

    const buttonActive = await prisma.setting.findFirst({
      where: {
        key: 'chatBotType',
        companyId,
      },
    })

    const botButton = async () => {
      const buttons = []
      queueOptions.forEach((option, i) => {
        buttons.push({
          buttonId: `${option.option}`,
          buttonText: { displayText: option.title },
          type: 4,
        })
      })
  
      buttons.push({
        buttonId: `#`,
        buttonText: { displayText: 'Menu inicial *[ 0 ]* Menu anterior' },
        type: 4,
      })

      const buttonMessage = {
        text: formatBody(`\u200e${queue.greetingMessage}`, contact),
        buttons,
        headerType: 4,
      }

      const sendMsg = await wbot.sendMessage(
        `${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
        buttonMessage
      )

      await verifyMessage(sendMsg, ticket, contact)
    }

    const botText = async () => {
      let options = queueOptions
        .map(option => `*[ ${option.option} ]* - ${option.title}`)
        .join('\n')
      options += `\n*[ 0 ]* - Menu anterior`
      options += `\n*[ # ]* - Menu inicial`

      const textMessage = { text: formatBody(`\u200e${queue.greetingMessage}\n\n${options}`, contact) }

      const sendMsg = await wbot.sendMessage(
        `${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
        textMessage
      )

      await verifyMessage(sendMsg, ticket, contact)
    }

    // if (buttonActive.value === "list") {
    //    return botList()
    // }

    if (buttonActive?.value === 'button' && queueOptions.length <= 4) {
      return botButton()
    }

    if (
      buttonActive?.value === 'text' ||
      (buttonActive?.value === 'button' && queueOptions.length > 4)
    ) {
      return botText()
    }
  } else if (!isNil(queue) && !isNil(updatedTicket.queueOptionId)) {
    const currentOption = await prisma.queueOption.findUnique({
      where: { id: updatedTicket.queueOptionId },
    })

    if (!currentOption) {
      throw new Error('Opção de fila não econtrada!')
    }

    const queueOptions = await prisma.queueOption.findMany({
      where: { parentId: updatedTicket.queueOptionId },
      orderBy: [{ option: 'asc' }, { createdAt: 'asc' }],
    })

    if (queueOptions.length > -1) {
      const companyId = ticket.companyId
      const buttonActive = await prisma.setting.findFirst({
        where: {
          key: 'chatBotType',
          companyId,
        },
      })

      const botList = async () => {
        const sectionsRow = []

        queueOptions.forEach((option, i) => {
          sectionsRow.push({
            title: option.title,
            rowId: `${option.option}`
          })
        })

        sectionsRow.push({
          title: "Menu inicial *[ 0 ]* Menu anterior",
          rowId: `#`,
        })

        const sections = [ { rows: sectionsRow } ]

        const listMessage = {
          text: formatBody(`\u200e${currentOption.message}`, contact),
          buttonText: "Escolha uma opção",
          sections
        }

        const sendMsg = await wbot.sendMessage(
          `${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
          listMessage
        )

        await verifyMessage(sendMsg, ticket, contact)
      }

      const botButton = async () => {
        const buttons = [];
        queueOptions.forEach((option, i) => {
          buttons.push({
            buttonId: `${option.option}`,
            buttonText: { displayText: option.title },
            type: 4
          });
        });
        buttons.push({
          buttonId: `#`,
          buttonText: { displayText: "Menu inicial *[ 0 ]* Menu anterior" },
          type: 4
        });

        const buttonMessage = {
          text: formatBody(`\u200e${currentOption.message}`, contact),
          buttons,
          headerType: 4
        };

        const sendMsg = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          buttonMessage
        );

        await verifyMessage(sendMsg, ticket, contact);
      }

      const botText = async () => {
        let options =  ""
        
        queueOptions
          .map(option => `*[ ${option.option} ]* - ${option.title}`)
          .join('\n')
        options += `\n*[ 0 ]* - Menu anterior`
        options += `\n*[ # ]* - Menu inicial`

        const textMessage = { text: formatBody(`\u200e${currentOption.message}\n\n${options}`, contact)}

        const sendMsg = await wbot.sendMessage(
          `${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
          textMessage
        )

        await verifyMessage(sendMsg, ticket, contact)
      }

      if (buttonActive?.value === 'list') { return botList() }

      if (buttonActive?.value === 'button' && queueOptions.length <= 4) { return botButton() }

      if (buttonActive?.value === 'text' || (buttonActive?.value === 'button' && queueOptions.length > 4)) { return botText() }
    }
  }
}

export default handleChartbot