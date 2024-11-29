import { Request, Response, NextFunction } from 'express'
import AppError from '../errors/AppError'
import * as Yup from 'yup'

const validate = (schema: Yup.ObjectSchema<any>, options = { stripUnknown: true }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { ...options, abortEarly: false })
      next()
    } catch (err: any) {
      const errors = err.inner?.map((error: any) => error.message) || [err.message]
      next(new AppError(errors.join(', '), 400))
    }
  }
}

export default validate