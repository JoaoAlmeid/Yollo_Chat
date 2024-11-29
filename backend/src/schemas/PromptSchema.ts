import * as Yup from 'yup';

const promptSchema = Yup.object().shape({
    name: Yup.string().required("ERR_PROMPT_NAME_INVALID"),
    prompt: Yup.string().required("ERR_PROMPT_PROMPT_INVALID"),
    apiKey: Yup.string().required("ERR_PROMPT_APIKEY_INVALID"),
    queueId: Yup.number().required("ERR_PROMPT_QUEUEID_INVALID"),
    maxMessages: Yup.number().required("ERR_PROMPT_MAX_MESSAGES_INVALID")
});

export default promptSchema