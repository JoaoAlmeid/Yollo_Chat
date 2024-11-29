import axios from 'axios'
import { initializeProviderConfig } from './initializeProviderConfig'

// Consulta o cliente IXC
export const fetchClientIxc = async (
  numberCPFCNPJ: string,
  companyId: number
) => {
  try {
    const config = await initializeProviderConfig(companyId)
    const { urlIxc, ixckeyBase64 } = config

    const options = {
      method: 'GET',
      url: `${urlIxc}/webservice/v1/cliente`,
      headers: {
        ixcsoft: 'listar',
        Authorization: `Basic ${ixckeyBase64}`,
      },
      data: {
        qtype: 'cliente.cnpj_cpf',
        query: numberCPFCNPJ,
        oper: '=',
        page: '1',
        rp: '1',
        sortname: 'cliente.cnpj_cpf',
        sortorder: 'asc',
      },
    }

    const response = await axios.request(options as any)
    return response.data
  } catch (error: any) {
    console.error(
      `Erro ao consultar cliente com CPF/CNPJ ${numberCPFCNPJ}:`,
      error
    )
    throw new Error('Failed to fetch client data.')
  }
}

export const fetchBoleto = async (id: string, companyId: number) => {
  try {
    const config = await initializeProviderConfig(companyId)
    const { urlIxc, ixckeyBase64 } = config

    const options = {
      method: 'GET',
      url: `${urlIxc}/webservice/v1/fn_areceber`,
      headers: {
        ixcsoft: 'listar',
        Authorization: `Basic ${ixckeyBase64}`,
      },
      data: {
        qtype: 'fn_areceber.id_cliente',
        query: id,
        oper: '=',
        page: '1',
        rp: '1',
        sortname: 'fn_areceber.data_vencimento',
        sortorder: 'asc',
        grid_param: '[{"TB":"fn_areceber.status", "OP" : "=", "P" : "A"}]',
      },
    }
    const response = await axios.request(options as any)
    return response.data
  } catch (error: any) {
    console.error(`Erro ao consultar boleto ${id}:`, error)
    throw new Error('Erro ao consultar boleto.')
  }
}
