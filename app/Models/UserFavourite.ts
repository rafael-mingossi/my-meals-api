import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Profile from './Profile'
import Food from './Food'
import Recipe from './Recipe'

export default class UserFavourite extends BaseModel {
  public static table = 'user_favorites'

  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: string

  @column()
  public food_id: number | null

  @column()
  public recipe_id: number | null

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @belongsTo(() => Profile, {
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof Profile>

  @belongsTo(() => Food, {
    foreignKey: 'food_id',
  })
  public food: BelongsTo<typeof Food>

  @belongsTo(() => Recipe, {
    foreignKey: 'recipe_id',
  })
  public recipe: BelongsTo<typeof Recipe>
}
