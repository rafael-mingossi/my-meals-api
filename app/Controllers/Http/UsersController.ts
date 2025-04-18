import 'App/Shared/Container/UserContainer'
import { container } from 'tsyringe'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { EditUserSchema, UpdateNotificationTokenSchema } from 'App/Validators/UserValidator'
import UserServices from "App/Services/UserService";

export default class UsersController {
  /**
   * Get user
   */
  public async get({ params, response }: HttpContextContract): Promise<void> {
    const userId = params.id
    const userServices = container.resolve(UserServices)
    const user = await userServices.get(userId)
    return response.json(user)
  }

  /**
   * Edit user
   */
  public async edit({ request, auth, response }: HttpContextContract): Promise<void> {
    const userId = auth.user?.id!
    const userDto = await request.validate({ schema: EditUserSchema })
    const userServices = container.resolve(UserServices)
    const user = await userServices.edit(userId, userDto)
    return response.json(user)
  }

  /**
   * Delete user
   */
  public async delete({ params, response }: HttpContextContract): Promise<void> {
    const userId = params.id
    const userServices = container.resolve(UserServices)
    await userServices.delete(userId)
    return response.json({ message: 'User deleted successfully.' })
  }

  /**
   * Update Notification Token
   */
  public async updateNotificationToken({ request, auth, response }: HttpContextContract): Promise<void> {
    const userId = auth.user?.id!
    const {token} = await request.validate({ schema: UpdateNotificationTokenSchema })

    const userServices = container.resolve(UserServices)
    await userServices.updateNotificationToken(userId, token)
    return response.json({ message: 'Notification token updated successfully.' })
  }

  /**
   * Delete Notification Token
   */
  public async deleteNotificationToken({ auth, response }: HttpContextContract): Promise<void> {
    const userId = auth.user?.id!
    const userServices = container.resolve(UserServices)
    await userServices.updateNotificationToken(userId, null)
    return response.json({ message: 'Notification token deleted successfully.' })
  }
}
