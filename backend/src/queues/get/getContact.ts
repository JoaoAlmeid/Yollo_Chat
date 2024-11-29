import prisma from '../../prisma/client'

export default async function getContact(id: number) {
  return await prisma.contactListItem.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      number: true,
      email: true,
    },
  })
}
