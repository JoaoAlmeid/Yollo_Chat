import { initializeConfig } from '../tokens'

export async function initializeProviderConfig(companyId: number) {
  try {
    const config = await initializeConfig(companyId)
    const { url, clientId, clientSecret, ixckeyBase64, urlIxc, asaasToken } =
      config
    console.log(url, clientId, clientSecret, ixckeyBase64, urlIxc, asaasToken)
    return config
  } catch (error: any) {
    console.error('Erro ao inicializar configuração:', error)
    throw error
  }
}
