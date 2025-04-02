import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Recipe from './Recipe'
import Food from './Food'

export default class RecipeItem extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public recipe_id: number

  @column()
  public food_id: number

  @column()
  public quantity: number

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime | null

  @belongsTo(() => Recipe, {
    foreignKey: 'recipe_id',
  })
  public recipe: BelongsTo<typeof Recipe>

  @belongsTo(() => Food, {
    foreignKey: 'food_id',
  })
  public food: BelongsTo<typeof Food>
}
