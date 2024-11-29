import AppError from "../../errors/AppError";
import { Prompt } from "@prisma/client";
import prisma from "../../prisma/client";

interface Data {
  promptId: string | number;
  companyId: string | number;
}
const ShowPromptService = async ({ promptId, companyId }: Data): Promise<Prompt> => {
  const prompt = await prisma.prompt.findUnique({
    where: {
      id: Number(promptId),
      companyId: Number(companyId)
    },
    include: {
      queue: true,
    }
  })

  if (!prompt) {
    throw new AppError("ERR_NO_PROMPT_FOUND", 404);
  }

  return prompt;
};
export default ShowPromptService;
