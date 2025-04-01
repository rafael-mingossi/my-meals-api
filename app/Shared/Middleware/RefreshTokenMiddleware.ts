import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RefreshTokenMiddleware {
  public async handle({ request, auth, response }: HttpContextContract, next: () => Promise<void>) {
    try {
      const refreshToken = request.header('refresh-token')

      if (!refreshToken) {
        return response.status(401).json({
          message: 'Refresh token is required',
        })
      }

      await auth.use('jwt').authenticate()
      await next()
    } catch (error) {
      return response.status(401).json({
        message: 'Invalid refresh token',
        error: error.message,
      })
    }
  }
}
