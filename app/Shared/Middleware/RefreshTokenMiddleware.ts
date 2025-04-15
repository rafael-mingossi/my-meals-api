import { JWTCustomPayloadData } from '@ioc:Adonis/Addons/Jwt';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import Env from '@ioc:Adonis/Core/Env'
import jwt_decode from "jwt-decode";
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

/**
 * ------------------------------------------------------
 * Refresh Token Middleware
 * ------------------------------------------------------
 * - This middleware is responsible for refresh JWT token
 * - I recommend using Refresh Token on the front end
 * - Usage: Route.middleware('refreshToken')
 *
 * @class RefreshTokenMiddleware
 * ------------------------------------------------------
 **/
export default class RefreshTokenMiddleware {
  public async handle({ auth, request, response }: HttpContextContract, next: () => Promise<void>) {
    try {
      await next()
    } catch (error) {
      if (error.code === 'E_UNAUTHORIZED_ACCESS') {
        let refreshToken = request.header('authorization')
        refreshToken = refreshToken?.slice(7)

        if (!refreshToken) {
          return response.unauthorized({ message: 'Token not provided' })
        }

        try {
          // Get payload data from JWT expired
          const { data: jwtData } = jwt_decode(refreshToken) as JWTCustomPayloadData;

          // Get user data from user id in JWT payload
          const userData = await Profile.find(jwtData.userId)

          if (!userData) {
            return response.unauthorized({ message: 'User not found' })
          }

          if (userData.remember_me_token) {
            // Define token expiration times
            const tokenExpiresIn = Env.get('TOKEN_EXPIRES_IN') || '30m'
            const refreshTokenExpiresIn = Env.get('REFRESH_TOKEN_EXPIRES_IN') || '30d'

            // Generate new JWT and refresh token
            const jwt = await auth.use('jwt').loginViaRefreshToken(userData.remember_me_token, {
              expiresIn: tokenExpiresIn,
              refreshTokenExpiresIn: refreshTokenExpiresIn
            });

            const user = auth.use('jwt').user as Profile
            user.remember_me_token = jwt?.toJSON().refreshToken.toString() ?? null
            await user.save()

            // Update token expiration date in database
            await this.updateTokenExpiration(jwt.toJSON().refreshToken, refreshTokenExpiresIn)

            return response.ok({ auth: jwt, user })
          }

        } catch (error) {
          return response.unauthorized({ message: 'Invalid or expired token' })
        }
      } else {
        throw error
      }
    }
  }

  /**
   * Update token expiration date in the database
   * Private helper method to fix token expiration dates
   */
  private async updateTokenExpiration(token: string, expiresInStr: string): Promise<void> {
    try {
      // Parse the expiration string to calculate the actual date
      let expiresAt = DateTime.now()

      const match = expiresInStr.match(/^(\d+)([mhdw])$/)
      if (match) {
        const value = parseInt(match[1])
        const unit = match[2]

        switch (unit) {
          case 'm': // minutes
            expiresAt = expiresAt.plus({ minutes: value })
            break
          case 'h': // hours
            expiresAt = expiresAt.plus({ hours: value })
            break
          case 'd': // days
            expiresAt = expiresAt.plus({ days: value })
            break
          case 'w': // weeks
            expiresAt = expiresAt.plus({ weeks: value })
            break
        }

        // Update the token's expiration date in the database
        await Database.from('jwt_tokens')
          .where('token', token)
          .update({ expires_at: expiresAt.toISO() })
      }
    } catch (error) {
      console.error('Error updating token expiration:', error)
    }
  }
}

// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
//
// export default class RefreshTokenMiddleware {
//   public async handle({ request, auth, response }: HttpContextContract, next: () => Promise<void>) {
//     try {
//       const refreshToken = request.header('refresh-token')
//
//       if (!refreshToken) {
//         return response.status(401).json({
//           message: 'Refresh token is required',
//         })
//       }
//
//       await auth.use('jwt').authenticate()
//       await next()
//     } catch (error) {
//       return response.status(401).json({
//         message: 'Invalid refresh token',
//         error: error.message,
//       })
//     }
//   }
// }
