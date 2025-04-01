import Profile from 'App/Models/Profile'
import { IUser } from 'App/Interfaces/IUser'

export default class UsersRepository {
  /**
   * Store a new user
   */
  public async store(data: IUser.DTOs.Store): Promise<Profile> {
    const profile = new Profile()
    profile.email = data.email
    profile.username = data.username
    profile.password = data.password
    profile.full_name = data.full_name || ''

    // Make sure to save the profile
    await profile.save()

    // Return with created_at and updated_at timestamps
    return profile
  }

  /**
   * Find user by email
   */
  public async findByEmail(email: string): Promise<Profile | null> {
    return Profile.query().where('email', email).first()
  }

  /**
   * Find user by username
   */
  public async findByUsername(username: string): Promise<Profile | null> {
    return Profile.query().where('username', username).first()
  }
}
