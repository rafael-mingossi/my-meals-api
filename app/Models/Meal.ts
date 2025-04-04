import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Profile from './Profile'
import MealItem from './MealItem'

export default class Meal extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: string

  @column()
  public meal_type: string

  @column.date()
  public date_added: DateTime

  @column()
  public t_calories: number

  @column()
  public t_carbs: number

  @column()
  public t_fat: number

  @column()
  public t_protein: number

  @column()
  public t_fibre: number

  @column()
  public t_sodium: number

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime | null

  @belongsTo(() => Profile, {
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof Profile>

  @hasMany(() => MealItem, {
    foreignKey: 'meal_id',
  })
  public items: HasMany<typeof MealItem>
}
