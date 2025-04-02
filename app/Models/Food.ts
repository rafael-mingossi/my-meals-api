import { DateTime } from 'luxon'
import {BaseModel, column, belongsTo, BelongsTo, HasMany, hasMany} from '@ioc:Adonis/Lucid/Orm'
import Profile from './Profile'
import FoodCategory from './FoodCategory'
import RecipeItem from './RecipeItem'

export default class Food extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: string

  @column()
  public category_id: number

  @column()
  public label: string

  @column()
  public protein: number

  @column()
  public carbs: number

  @column()
  public fat: number

  @column()
  public calories: number

  @column()
  public fibre: number | null

  @column()
  public sodium: number | null

  @column()
  public serv_size: number

  @column()
  public serv_unit: string

  @column()
  public food_img: string | null

  @column()
  public is_archived: boolean

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime | null

  @belongsTo(() => Profile, {
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof Profile>

  @belongsTo(() => FoodCategory, {
    foreignKey: 'category_id',
  })
  public category: BelongsTo<typeof FoodCategory>

  @hasMany(() => RecipeItem, {
    foreignKey: 'food_id',
  })
  public recipeItems: HasMany<typeof RecipeItem>
}
