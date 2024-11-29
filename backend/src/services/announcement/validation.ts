import * as Yup from 'yup'
import AppError from 'src/errors/AppError';

const validateAnnouncementSchema = async (data: any) => {
    const ticketnoteSchema = Yup.object().shape({
        title: Yup.string().required("ERR_ANNOUNCEMENT_REQUIRED"),
        text: Yup.string().required("ERR_ANNOUNCEMENT_REQUIRED")
    });
    
    try {
      await ticketnoteSchema.validate({ data });
    } catch (err: any) {
      throw new AppError(err.message);
    }
}

export default validateAnnouncementSchema