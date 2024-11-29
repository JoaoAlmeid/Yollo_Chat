import ffmpeg from 'fluent-ffmpeg'

const convertWavToAnotherFormat = (inputPath: string, outputPath: string, toFormat: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputPath)
        .toFormat(toFormat)
        .on("start", (comandLine) => {
            console.log(`Conversão iniciada: ${comandLine}`)
        })
        .on("progress", (progress) => {
            console.log(`Progresso: ${progress.percent}% concluído`)
        })
        .on("end", () => {
            console.log(`Conversão finalizada: ${outputPath}`)
            resolve(outputPath)
        })
        .on("error", (err: { message: string }) => {
            console.error(`Erro ao converter arquivo: ${err.message}`)
            reject(new Error(`Erro ao converter arquivo: ${err.message}`))
        }
        )
        .save(outputPath)
    })
}

export default convertWavToAnotherFormat