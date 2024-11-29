import { initializeProviderConfig } from './initializeProviderConfig'
import axios from 'axios'

export const gerarCodigoBarras = async (
  idBoleto: string,
  companyId: number
) => {
  try {
    const config = await initializeProviderConfig(companyId)
    const { urlIxc, ixckeyBase64 } = config

    const options = {
      method: 'GET',
      url: `${urlIxc}/webservice/v1/get_boleto`,
      headers: {
        ixcsoft: 'listar',
        Authorization: `Basic ${ixckeyBase64}`,
      },
      data: {
        boletos: idBoleto,
        juro: 'N',
        multa: 'N',
        atualiza_boleto: 'N',
        tipo_boleto: 'arquivo',
        base64: 'S',
      },
    }
    await axios.request(options as any)
  } catch (error: any) {
    console.error(`Erro ao gerar código de barras ${idBoleto}:`, error)
    throw new Error('Erro ao gerar código de barras.')
  }
}
