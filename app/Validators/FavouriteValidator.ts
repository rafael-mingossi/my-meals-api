import { schema, rules } from '@ioc:Adonis/Core/Validator'

export const AddFoodFavouriteSchema = schema.create({
  food_id: schema.number([
    rules.exists({ table: 'foods', column: 'id' })
  ])
})

export const AddRecipeFavouriteSchema = schema.create({
  recipe_id: schema.number([
    rules.exists({ table: 'recipes', column: 'id' })
  ])
})
