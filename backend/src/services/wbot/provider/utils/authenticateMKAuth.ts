import axios from 'axios'

export const authenticateMKAuth = async (
  urlMkauth: string,
  clientId: string,
  clientSecret: string
) => {
  const authResponse = await axios({
    method: 'get',
    url: `${urlMkauth}/api/auth`,
    auth: {
      username: clientId,
      password: clientSecret,
    },
  })
  return authResponse.data
}
