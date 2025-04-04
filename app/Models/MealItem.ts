import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Meal from './Meal'
import Food from './Food'
import Recipe from './Recipe'

export default class MealItem extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public meal_id: number

  @column()
  public food_id: number | null

  @column()
  public food_quantity: number | null

  @column()
  public recipe_id: number | null

  @column()
  public recipe_quantity: number | null

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime | null

  @belongsTo(() => Meal, {
    foreignKey: 'meal_id',
  })
  public meal: BelongsTo<typeof Meal>

  @belongsTo(() => Food, {
    foreignKey: 'food_id',
  })
  public food: BelongsTo<typeof Food>

  @belongsTo(() => Recipe, {
    foreignKey: 'recipe_id',
  })
  public recipe: BelongsTo<typeof Recipe>
}
