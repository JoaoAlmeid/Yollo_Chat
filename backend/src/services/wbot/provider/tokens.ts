import prisma from '../../../prisma/client'

interface Setting { key: string; value: string }

// Função para buscar uma configuração pelo `key` e `companyId`
const getSetting = async ( key: string, companyId: number ): Promise<Setting | null> => {
  try {
    const setting = await prisma.setting.findFirst({
      where: {
        key,
        companyId,
      },
    })
    return setting ? { key: setting.key, value: setting.value } : null
  } catch (error: any) {
    console.error(`Erro ao buscar configurações com a chave ${key}:`, error)
    throw new Error('Erro ao buscar configurações.')
  }
}

// Funções específicas para cada configuração
export const getAsaasToken = async (companyId: number) => {
  return getSetting('asaas', companyId)
}

export const getIxcApiKey = async (companyId: number) => {
  return getSetting('tokenixc', companyId)
}

export const getUrlIxcDb = async (companyId: number) => {
  return getSetting('ipixc', companyId)
}

export const getIpmkAuth = async (companyId: number) => {
  return getSetting('ipmkauth', companyId)
}

export const getClientIdMkauth = async (companyId: number) => {
  return getSetting('clientidmkauth', companyId)
}

export const getClientSecretMkauth = async (companyId: number) => {
  return getSetting('clientsecretmkauth', companyId)
}

// Função para inicializar as variáveis de configuração
export const initializeConfig = async (companyId: number) => {
  const ipmkauthValue = (await getIpmkAuth(companyId))?.value || ''
  const clientIdMkauthValue = (await getClientIdMkauth(companyId))?.value || ''
  const clientSecretMkauth =
    (await getClientSecretMkauth(companyId))?.value || ''
  const ixcaApiKeyValue = (await getIxcApiKey(companyId))?.value || ''
  const urlIxcDbValue = (await getUrlIxcDb(companyId))?.value || ''
  const asaasTokenValue = (await getAsaasToken(companyId))?.value || ''

  // Limpar e ajustar Url
  let urlMkaut = ipmkauthValue
  if (urlMkaut.endsWith('/')) {
    urlMkaut = urlMkaut.slice(0, -1)
  }

  // Constantes
  const url = `${urlMkaut}/api`
  const clientId = clientIdMkauthValue
  const clientSecret = clientSecretMkauth
  const ixckeyBase64 = Buffer.from(ixcaApiKeyValue).toString('base64')
  const urlIxc = urlIxcDbValue
  const asaasToken = asaasTokenValue

  return {
    url,
    clientId,
    clientSecret,
    ixckeyBase64,
    urlIxc,
    asaasToken,
  }
}
