import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Food from './Food'

export default class FoodCategory extends BaseModel {
  public static table = 'food_categories'

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public icon_url: string

  @column()
  public description: string | null

  @column()
  public display_order: number | null

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime | null

  @hasMany(() => Food, {
    foreignKey: 'category_id',
  })
  public foods: HasMany<typeof Food>
}
