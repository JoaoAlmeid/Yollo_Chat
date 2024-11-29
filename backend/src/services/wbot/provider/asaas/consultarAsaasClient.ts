import axios from 'axios'

export const getCustomer = async (cpfCnpj: string, asaastk: string) => {
  const options = {
    method: 'GET',
    url: 'https://www.asaas.com/api/v3/customers',
    params: { cpfCnpj },
    headers: {
      'Content-Type': 'application/json',
      access_token: asaastk,
    },
  }

  try {
    const response = await axios.request(options as any)
    return response.data
  } catch (error: any) {
    throw new Error('Erro ao consultar cliente')
  }
}

export const getPayments = async (
  customerId: string,
  status: string,
  asaastk: string
) => {
  const options = {
    method: 'GET',
    url: 'https://www.asaas.com/api/v3/payments',
    params: { customer: customerId, status },
    headers: {
      'Content-Type': 'application/json',
      access_token: asaastk,
    },
  }

  try {
    const response = await axios.request(options as any)
    return response.data
  } catch (error: any) {
    throw new Error('Erro ao consultar pagamentos')
  }
}

export const getPixQrCode = async (paymentId: string, asaastk: string) => {
  const options = {
    method: 'GET',
    url: `https://www.asaas.com/api/v3/payments/${paymentId}/pixQrCode`,
    headers: {
      'Content-Type': 'application/json',
      access_token: asaastk,
    },
  }

  try {
    const response = await axios.request(options as any)
    return response.data
  } catch (error: any) {
    throw new Error('Erro ao obter QR Code PIX')
  }
}

export const getIdentificationField = async (
  paymentId: string,
  asaastk: string
) => {
  const options = {
    method: 'GET',
    url: `https://www.asaas.com/api/v3/payments/${paymentId}/identificationField`,
    headers: {
      'Content-Type': 'application/json',
      access_token: asaastk,
    },
  }

  try {
    const response = await axios.request(options as any)
    return response.data
  } catch (error: any) {
    throw new Error('Erro ao obter código de barras')
  }
}
