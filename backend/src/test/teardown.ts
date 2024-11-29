import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const cleanupTestDatabase = async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Post", "Comment" CASCADE;`
}

export default async function globalTeardown() {
  await cleanupTestDatabase()
  await prisma.$disconnect()
}
