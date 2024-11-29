import axios from 'axios'

// Função para consultar cliente na base de dados
export async function consultarCliente(
  urlixc: string,
  ixckeybase64: string,
  numberCPFCNPJ: string
) {
  const options = {
    method: 'GET',
    url: `${urlixc}/webservice/v1/cliente`,
    headers: {
      ixcsoft: 'listar',
      Authorization: `Basic ${ixckeybase64}`,
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

  const response = await axios.request(options)
  return response.data
}

// Função para consultar boleto na base de dados
export async function consultarBoleto(
  urlixc: string,
  ixckeybase64: string,
  id: string
) {
  const boletoOptions = {
    method: 'GET',
    url: `${urlixc}/webservice/v1/fn_areceber`,
    headers: {
      ixcsoft: 'listar',
      Authorization: `Basic ${ixckeybase64}`,
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

  const response = await axios.request(boletoOptions)
  return response.data
}

// Função para gerar QR code do PIX
export async function gerarPix(
  urlixc: string,
  ixckeybase64: string,
  idboleto: string
) {
  const pixOptions = {
    method: 'GET',
    url: `${urlixc}/webservice/v1/get_pix`,
    headers: {
      ixcsoft: 'listar',
      Authorization: `Basic ${ixckeybase64}`,
    },
    data: { id_areceber: idboleto },
  }

  const response = await axios.request(pixOptions)
  return response.data
}
