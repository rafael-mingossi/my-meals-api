import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Profile from './Profile'

export default class JwtToken extends BaseModel {
  public static table = 'jwt_tokens'

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: string

  @column()
  public name: string

  @column()
  public type: string

  @column()
  public token: string

  @column.dateTime()
  public expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => Profile, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof Profile>
}
