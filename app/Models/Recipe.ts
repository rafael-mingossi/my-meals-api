import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Profile from './Profile'
import RecipeItem from './RecipeItem'
import MealItem from './MealItem'
import UserFavourite from './UserFavourite'

export default class Recipe extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: string

  @column()
  public name: string

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

  @column()
  public serving: number | null

  @column()
  public serv_unit: string | null

  @column()
  public img: string | null

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

  @hasMany(() => RecipeItem, {
    foreignKey: 'recipe_id',
  })
  public items: HasMany<typeof RecipeItem>

  @hasMany(() => MealItem, {
    foreignKey: 'recipe_id',
  })
  public mealItems: HasMany<typeof MealItem>

  @hasMany(() => UserFavourite, {
    foreignKey: 'recipe_id',
  })
  public userFavourites: HasMany<typeof UserFavourite>
}
