import { TicketTracking } from '@prisma/client'

const verifyRating = (ticketTraking: TicketTracking) => {
  if (
    ticketTraking &&
    ticketTraking.finishedAt === null &&
    ticketTraking.userId !== null &&
    ticketTraking.ratingAt !== null
  ) {
    return true
  }
  return false
}

export default verifyRating