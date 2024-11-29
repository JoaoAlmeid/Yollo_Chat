import AppError from "../../../errors/AppError"

const msgLocation = (image: Buffer | undefined, latitude: number, longitude: number): string => {
  if (!image) {
    throw new AppError("Imagem não fornecida para gerar a localização", 400)
  }
  try {
    const b64 = image.toString('base64')
    const data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude},${longitude}`
    
    return data
  } catch (error: any) {
    console.error(`Erro ao converter imagem para base64: ${error}`)
    throw new AppError(`Erro ao obter localização: ${error.message}`, 500)
  }
}

export default msgLocation