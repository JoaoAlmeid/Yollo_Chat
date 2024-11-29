import { SpeechConfig, AudioConfig, SpeechSynthesizer, SpeechSynthesisResult, ResultReason } from "microsoft-cognitiveservices-speech-sdk";
import convertWavToAnotherFormat from "./convertWavToAnotherFormat";
import fs from 'fs'

const convertTextToSpeechAndSaveToFile = (
    text: string,
    filename: string,
    subscriptionKey: string,
    serviceRegion: string,
    voice: string = "pt-BR-FabioNeural",
    audioToFormat: string = "mp3",
    shouldDeleteWav: boolean = true
): Promise<void> => {
    return new Promise((resolve, reject) => {
      const speechConfig = SpeechConfig.fromSubscription(
        subscriptionKey,
        serviceRegion
      );
      speechConfig.speechSynthesisVoiceName = voice;

      const audioConfig = AudioConfig.fromAudioFileOutput(`${filename}.wav`);
      const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

      synthesizer.speakTextAsync(
        text,
        async (result: SpeechSynthesisResult) => {
          if (result.reason === ResultReason.SynthesizingAudioCompleted) {
            try {
                await convertWavToAnotherFormat(
                  `${filename}.wav`,
                  `${filename}.${audioToFormat}`,
                  audioToFormat
                )

                if (shouldDeleteWav) {
                    fs.unlinkSync(`${filename}.wav`)
                }
                
                resolve()
            } catch (error: any) {
                console.error("Erro durante a conversão do áudio: ", error)
                reject(error)
            }
          } else {
            const errorMsg = `Erro durante a síntese de fala: ${result.errorDetails}`
            reject(new Error(errorMsg));
          }
          synthesizer.close();
        },
        error => {
          console.error(`Error ao iniciar a síntese de fala: ${error}`);
          synthesizer.close();
          reject(error);
        }
      );
    });
}

export default convertTextToSpeechAndSaveToFile