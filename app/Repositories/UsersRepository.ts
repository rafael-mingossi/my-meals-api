import BaseRepository from 'App/Shared/Repositories/BaseRepository'
import Profile from 'App/Models/Profile'
import { IUser } from 'App/Interfaces/IUser'

export default class UsersRepository
  extends BaseRepository<typeof Profile>
  implements IUser.Repository
{
  constructor() {
    super(Profile)
  }

  /**
   * Find user by email
   */
  public async findByEmail(email: string): Promise<Profile | null> {
    return this.findBy('email', email)
  }

  /**
   * Find user by username
   */
  public async findByUsername(username: string): Promise<Profile | null> {
    return this.findBy('username', username)
  }
}
