import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LoginSchema, StoreUserSchema, ForgotPasswordSchema, EditPasswordSchema } from 'App/Validators/UserValidator'
import AuthorizationException from 'App/Shared/Exceptions/AuthorizationException'
import UsersRepository from 'App/Repositories/UsersRepository'
import { IUser } from 'App/Interfaces/IUser'
import Env from '@ioc:Adonis/Core/Env'
import Hash from '@ioc:Adonis/Core/Hash'
import Profile from 'App/Models/Profile'
import crypto from 'crypto'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import { JWTTokenContract } from '@ioc:Adonis/Addons/Jwt'

export default class AuthController {
  /**
   * Login
   */
  public async login({ request, auth, response }: HttpContextContract): Promise<void> {
    try {
      const userDto: IUser.DTOs.Login = await request.validate({ schema: LoginSchema })

      const rememberMe = userDto.rememberMe === undefined ? true : userDto.rememberMe

      const jwt = await auth
        .use('jwt')
        .attempt(
          userDto.email,
          userDto.password,
          rememberMe ? {
            expiresIn: Env.get('TOKEN_EXPIRES_IN', '30m'),
            refreshTokenExpiresIn: Env.get('REFRESH_TOKEN_EXPIRES_IN', '30d')
          } : {
            expiresIn: '10m',
            refreshTokenExpiresIn: '10d'
          })

      const user = auth.use('jwt').user as Profile
      const userPayload = await this.generateRememberToken(user, jwt)

      return response.json({ auth: jwt, user: userPayload})
    } catch (error) {
      throw new AuthorizationException(
        'Unable to login, please check your credentials or try again later.'
      )
    }
  }

  // Replace the login method in your AuthController with this one:
  // public async login({ request, auth, response }: HttpContextContract): Promise<void> {
  //   try {
  //     const { email, password, rememberMe = true } = request.only(['email', 'password', 'rememberMe'])
  //
  //     // Log the credentials being used (without password)
  //     console.log(`Login attempt for email: ${email} with rememberMe: ${rememberMe}`)
  //
  //     try {
  //       // Attempt authentication with detailed options
  //       const jwt = await auth.use('jwt').attempt(
  //         email,
  //         password,
  //         rememberMe ? {
  //           expiresIn: Env.get('TOKEN_EXPIRES_IN', '30m'),
  //           refreshTokenExpiresIn: Env.get('REFRESH_TOKEN_EXPIRES_IN', '30d')
  //         } : {
  //           expiresIn: '10m',
  //           refreshTokenExpiresIn: '10d'
  //         }
  //       )
  //
  //       console.log('JWT token generated successfully')
  //
  //       const user = auth.use('jwt').user as Profile
  //       if (!user) {
  //         return response.status(500).json({
  //           error: 'User not available after authentication'
  //         })
  //       }
  //
  //       // Log user info (safely)
  //       console.log(`User authenticated: ${user.id} (${user.email})`)
  //
  //       // Generate remember token
  //       const userPayload = await this.generateRememberToken(user, jwt)
  //
  //       return response.json({ auth: jwt, user: userPayload })
  //     } catch (authError) {
  //       console.error('Auth error:', authError.message, authError.stack)
  //       return response.status(401).json({
  //         error: 'Authentication failed',
  //         message: authError.message,
  //         type: authError.constructor.name
  //       })
  //     }
  //   } catch (error) {
  //     console.error('Login error:', error.message, error.stack)
  //     return response.status(500).json({
  //       error: 'Login failed',
  //       message: error.message,
  //       type: error.constructor.name
  //     })
  //   }
  // }

  /**
   * Logout
   */
  public async logout({ auth, response }: HttpContextContract): Promise<void> {
    try {
      const user = auth.use('jwt').user as Profile

      await auth.use('jwt').revoke({
        refreshToken: user?.remember_me_token ?? '',
      })

      await this.generateRememberToken(user, null)

      await Database.from('jwt_tokens').where('user_id', user.id).delete()
      auth.use('jwt').isLoggedOut

      return response.json({ message: 'Logout successfully' })

    } catch (error) {
      throw new AuthorizationException(
        'Unable to logout, please try again later.'
      )
    }
  }

  /**
   * Check if username is available
   */
  public async isUsernameAvailable({ request, response }: HttpContextContract) {
    try {
      const username = request.input('username')

      if (!username) {
        return response.status(400).json({ message: 'username is required' })
      }

      // Check if the username already exists in the database
      const existingUser = await Profile.findBy('username', username)

      if (existingUser) {
        return response.status(200).json({ message: 'username is not available', isAvailable: false })
      } else {
        return response.status(200).json({ message: 'username is available',  isAvailable: true })
      }
    } catch (error) {
      return response.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Check if email is available
   */
  public async isEmailAvailable({ request, response }: HttpContextContract) {
    try {
      const email = request.input('email')

      if (!email) {
        return response.status(400).json({ message: 'email is required' })
      }

      // Check if the email already exists in the database
      const existingUser = await Profile.findBy('email', email)

      if (existingUser) {
        return response.status(200).json({ message: 'email is not available', isAvailable: false })
      } else {
        return response.status(200).json({ message: 'email is available', isAvailable: true })
      }
    } catch (error) {
      return response.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Register a new user
   */
  public async register({ request, response }: HttpContextContract): Promise<void> {
    const userDto: IUser.DTOs.Store = await request.validate({ schema: StoreUserSchema })
    const usersRepository = new UsersRepository()

    const user = await usersRepository.store(userDto)

    return response.json(user)
  }

  /**
   * Forgot Password
   */
  public async forgotPassword({ request, response }: HttpContextContract): Promise<void> {
    try {
      const userDto: IUser.DTOs.ForgotPassword = await request.validate({schema: ForgotPasswordSchema})

      const user = await Profile.findBy('email', userDto.email)

      if (!user) {
        return response.status(401).json({ errors: [{ message: 'User not found' }] })
      }

      // Generate random token
      const tempToken = crypto.randomBytes(10).toString('hex')

      // Generate a temporary password (10 characters with numbers)
      const tempPassword = crypto.randomBytes(5).toString('hex')

      // Base64 encode email and temp password
      const encodedEmail = Buffer.from(user.email).toString('base64')
      const encodedPasswordTemp = Buffer.from(tempPassword).toString('base64')

      user.temp_token = tempToken
      user.temp_password = encodedPasswordTemp
      user.temp_token_create_at = DateTime.now()

      await user.save()

      // In a production app, you would send an email here
      // Since you don't have the mail dependency, we'll just return info for testing
      return response.status(200).json({
        message: 'Token created successfully',
        debug: {
          tempToken,
          tempPassword,
          resetUrl: `${Env.get('RESET_PASSWORD_URL', 'http://localhost:3000/reset-password')}/${tempToken}/${encodedEmail}`
        }
      })

    } catch (error) {
      return response.status(400).json({ errors: [{ message: 'Error to request new token' }] })
    }
  }

  /**
   * Reset Password
   */
  public async resetPassword({ params, response }: HttpContextContract): Promise<void> {
    try {
      const { tempToken, email } = params

      // Decode email from base64
      const emailToString = Buffer.from(email, 'base64').toString()

      const user = await Profile.findBy('email', emailToString)

      if (!user) {
        return response.status(401).json({ errors: [{ message: 'User not found' }] })
      }

      const sameToken = tempToken === user.temp_token

      if (!sameToken) {
        return response
          .status(401)
          .json({ errors: [{ message: 'Token not found' }] })
      }

      // Check if token is expired (3 hours validity)
      // Convert Luxon DateTime to JS Date for date-fns
      const tokenCreatedAt = user.temp_token_create_at?.toJSDate()

      if (!tokenCreatedAt) {
        return response.status(401).json({ errors: [{ message: 'Invalid token date' }] })
      }

      // Add 3 hours to token creation time
      const expiryDate = new Date(tokenCreatedAt.getTime() + (3 * 60 * 60 * 1000))
      const isExpiredToken = new Date() > expiryDate

      if (isExpiredToken) {
        return response.status(401).json({ errors: [{ message: 'Token expired' }] })
      }

      // Decode the temporary password and set it
      if (user.temp_password) {
        user.password = Buffer.from(user.temp_password, 'base64').toString()
      }

      user.temp_password = null
      user.temp_token = null
      user.temp_token_create_at = null

      await user.save()

      return response.status(200).json({ message: 'Password changed successfully' })
    } catch (error) {
      return response.status(400).json({ errors: [{ message: error.message || 'User not found' }] })
    }
  }

  /**
   * Edit Password
   */
  public async editPassword({ request, auth, response }: HttpContextContract): Promise<void> {
    const userDto: IUser.DTOs.EditPassword = await request.validate({ schema: EditPasswordSchema })

    const user = await Profile.findBy('id', auth.user?.id)
    if (!user) {
      return response.status(401).json({ errors: [{ message: 'User not found' }] })
    }

    const currentPasswordIsValid = await Hash.verify(user.password, userDto.currentPassword)
    if (!currentPasswordIsValid) {
      return response.status(400).json({ errors: [{ message: 'Current password is wrong' }] })
    }

    const newsIsEqualsToCurrent = await Hash.verify(user.password, userDto.newPassword)
    if(newsIsEqualsToCurrent) {
      return response.status(400).json({ errors: [{ message: 'New password is equal to current password' }] })
    }

    user.password = userDto.newPassword

    await user.save()

    return response.status(200).json({ message: 'Password changed successfully' })
  }

  /**
   * Refresh Token
   */
  public async refreshToken({ auth, response, request }: HttpContextContract): Promise<void> {
    try {
      const refreshToken = request.input("refreshToken");

      const jwt = await auth.use('jwt').loginViaRefreshToken(refreshToken, {
        expiresIn: Env.get('TOKEN_EXPIRES_IN', '30m'),
        refreshTokenExpiresIn: Env.get('REFRESH_TOKEN_EXPIRES_IN', '30d')
      });

      const user = auth.use('jwt').user as Profile
      const userPayload = await this.generateRememberToken(user, jwt)

      return response.json({ auth: jwt, user: userPayload})
    } catch (error) {
      throw new AuthorizationException(
        'Unable to refresh token, please try again later.'
      )
    }
  }

  /**
   * Generate remember token
   */
  private async generateRememberToken(user: Profile, jwt: JWTTokenContract<Profile>|null): Promise<Profile> {
    user.remember_me_token = jwt?.toJSON().refreshToken.toString() ?? null
    await user.save()

    return user
  }

  // Add this to your AuthController.ts
  public async debugLogin({ request, response }: HttpContextContract): Promise<void> {
    try {
      const { email, password } = request.only(['email', 'password'])

      // Step 1: Verify user exists with this email
      const user = await Profile.findBy('email', email)
      if (!user) {
        return response.status(404).json({
          error: 'User not found',
          email
        })
      }

      // Step 2: Verify password matches
      const passwordMatches = await Hash.verify(user.password, password)
      if (!passwordMatches) {
        return response.status(401).json({
          error: 'Password does not match',
          providedHash: await Hash.make(password),
          storedHash: user.password.substring(0, 10) + '...'  // Only show part of the hash for security
        })
      }

      // Step 3: Check JWT configuration
      const privateKey = Env.get('JWT_PRIVATE_KEY', '').replace(/\\n/g, '\n')
      const publicKey = Env.get('JWT_PUBLIC_KEY', '').replace(/\\n/g, '\n')

      if (!privateKey || !publicKey) {
        return response.status(500).json({
          error: 'JWT keys not configured properly',
          privateKeyLength: privateKey.length,
          publicKeyLength: publicKey.length
        })
      }

      // If we get here, everything looks good for auth to work
      return response.json({
        message: 'Prerequisites for login are met',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Debug login failed',
        message: error.message,
        stack: error.stack
      })
    }
  }

  // Add this method to your AuthController
  // public async testJwt({ request, response }: HttpContextContract): Promise<void> {
  //   try {
  //     const { email } = request.only(['email'])
  //
  //     // Find the user
  //     const user = await Profile.findBy('email', email)
  //     if (!user) {
  //       return response.status(404).json({ error: 'User not found' })
  //     }
  //
  //     // Import JWT directly
  //     const Jwt = (await import('@ioc:Adonis/Addons/Jwt')).default
  //
  //     // Get keys directly
  //     const privateKey = Env.get('JWT_PRIVATE_KEY', '').replace(/\\n/g, '\n')
  //     const publicKey = Env.get('JWT_PUBLIC_KEY', '').replace(/\\n/g, '\n')
  //
  //     // Try to generate a token directly
  //     try {
  //       // Create payload
  //       const payload = {
  //         uid: user.id,
  //         email: user.email,
  //         // Add other necessary fields
  //       }
  //
  //       // Generate token with RS256 algorithm
  //       const token = await Jwt.generate(payload, {
  //         expiresIn: '30m',
  //         algorithm: 'RS256',
  //         privateKey
  //       })
  //
  //       // Verify token
  //       const verified = await Jwt.verify(token, {
  //         algorithm: 'RS256',
  //         publicKey
  //       })
  //
  //       return response.json({
  //         success: true,
  //         token,
  //         verified
  //       })
  //     } catch (jwtError) {
  //       return response.status(500).json({
  //         error: 'JWT generation failed',
  //         message: jwtError.message,
  //         stack: jwtError.stack
  //       })
  //     }
  //   } catch (error) {
  //     return response.status(500).json({
  //       error: 'Test JWT failed',
  //       message: error.message,
  //       stack: error.stack
  //     })
  //   }
  // }
}
