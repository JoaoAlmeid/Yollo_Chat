import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const runPrismaMigrations = () => {
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  } catch (error: any) {
    console.error('Erro ao aplicar migrações:', error)
    process.exit(1)
  }
}

const setupTestDatabase = async () => {
  await runPrismaMigrations()
}

// Exporta uma função assíncrona para o Jest
export default async function globalSetup() {
  await setupTestDatabase()
}
