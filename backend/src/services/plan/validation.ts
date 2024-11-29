import AppError from 'src/errors/AppError';
import prisma from '../../prisma/client';
import * as Yup from 'yup'

const validatePlan = async (data: any) => {
    const planSchema = Yup.object().shape({
        name: Yup.string()
          .min(2, "ERR_PLAN_INVALID_NAME")
          .required("ERR_PLAN_INVALID_NAME")
          .test(
            "Check-unique-name",
            "ERR_PLAN_NAME_ALREADY_EXISTS",
            async value => {
              if (value) {
                const planWithSameName = await prisma.plan.findUnique({
                  where: { name: value }
                });
    
                return !planWithSameName;
              }
              return false;
            }
          )
    });
    
    try {
      await planSchema.validate({ data });
    } catch (err) {
      throw new AppError(err.message);
    }
}

export default validatePlan