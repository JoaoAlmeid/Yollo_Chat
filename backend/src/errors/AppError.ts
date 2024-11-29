class AppError extends Error {
  public readonly statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'

    // Captura o stack trace se o ambiente não for de produção
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default AppError
