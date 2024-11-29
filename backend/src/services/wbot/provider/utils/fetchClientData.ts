import axios from 'axios'

export const fetchClientData = async (
  urlMkauth: string,
  numberCPFCNPJ: string,
  jwt: string
) => {
  const clientResponse = await axios.get(
    `${urlMkauth}/api/cliente/show/${numberCPFCNPJ}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  )
  return clientResponse.data
}
