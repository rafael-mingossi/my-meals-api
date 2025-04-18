import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, column, beforeSave, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import JwtToken from './JwtToken'
import Food from "App/Models/Food";
import Recipe from './Recipe';
import Meal from './Meal';
import UserFavourite from './UserFavourite';

export default class Profile extends BaseModel {
  public static table = 'profiles'

  @column({ isPrimary: true })
  public id: string

  @column()
  public username: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public full_name: string

  @column()
  public avatar_url: string

  @column()
  public gender: string

  @column()
  public height: number

  @column()
  public weight: number

  @column()
  public cal_goal: number

  @column()
  public protein_goal: number

  @column()
  public carbs_goal: number

  @column()
  public fat_goal: number

  @column()
  public notification_token: string | null

  @column()
  public temp_token: string | null

  @column()
  public temp_password: string | null

  @column()
  public remember_me_token: string | null

  @column.dateTime()
  public temp_token_create_at: DateTime | null

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @column()
  public is_deleted: boolean

  @column.dateTime()
  public deleted_at: DateTime | null

  @hasMany(() => JwtToken, {
    foreignKey: 'userId',
  })
  public tokens: HasMany<typeof JwtToken>

  @hasMany(() => Food, {
    foreignKey: 'user_id',
  })
  public foods: HasMany<typeof Food>

  @hasMany(() => Recipe, {
    foreignKey: 'user_id',
  })
  public recipes: HasMany<typeof Recipe>

  @hasMany(() => Meal, {
    foreignKey: 'user_id',
  })
  public meals: HasMany<typeof Meal>

  @hasMany(() => UserFavourite, {
    foreignKey: 'user_id',
  })
  public favorites: HasMany<typeof UserFavourite>

  @beforeSave()
  public static async hashPassword(profile: Profile) {
    if (profile.$dirty.password) {
      profile.password = await Hash.make(profile.password)
    }
  }
}
