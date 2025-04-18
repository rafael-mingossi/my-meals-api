import { injectable, inject } from 'tsyringe'
import { DateTime } from 'luxon'
import crypto from 'crypto'

import { IUser } from 'App/Interfaces/IUser'
import Profile from 'App/Models/Profile'
import NotFoundException from 'App/Shared/Exceptions/NotFoundException'
import BadRequestException from 'App/Shared/Exceptions/BadRequestException'

@injectable()
export default class UserServices {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUser.Repository
  ) {}

  public async get(id: string): Promise<Profile> {
    const user = await this.usersRepository.findBy('id', id)
    if (!user) throw new NotFoundException('User not found or not available.')

    return user
  }

  public async store(data: IUser.DTOs.Store): Promise<Profile> {
    const user = await this.usersRepository.store(data)
    return user.refresh()
  }

  public async edit(id: string, data: IUser.DTOs.Edit): Promise<Profile> {
    const user = await this.usersRepository.findBy('id', id)
    if (!user) throw new NotFoundException('User not found or not available.')

    user.merge(data)
    await this.usersRepository.save(user)

    return user.refresh()
  }

  public async delete(id: string): Promise<void> {
    const user = await this.usersRepository.findBy('id', id)
    if (!user) throw new NotFoundException('User not found or not available.')

    user.merge({
      email: `deleted:${user.email}:${crypto.randomBytes(6).toString('hex')}`,
      username: `deleted:${user.username}:${crypto.randomBytes(6).toString('hex')}`,
      is_deleted: true,
      deleted_at: DateTime.now(),
    })
    await this.usersRepository.save(user)
  }

  public async updateNotificationToken(id: string, token: string | null): Promise<void> {
    const user = await this.usersRepository.findBy('id', id);
    if (!user) throw new NotFoundException('User not found or not available.')

    if(token === null && user.notification_token == null){
      throw new BadRequestException('There is no token to be deleted.')
    }

    user.notification_token = token
    await this.usersRepository.save(user)
  }
}
