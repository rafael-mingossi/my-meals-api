import { schema, rules } from '@ioc:Adonis/Core/Validator'

// Schema for meal items (can be food or recipe)
const mealItemSchema = schema.object().members({
  id: schema.number.optional(),
  food_item: schema.object.optional().members({
    id: schema.number.optional(),
    food_id: schema.number([
      rules.exists({ table: 'foods', column: 'id' })
    ]),
    quantity: schema.number([rules.unsigned()])
  }),
  recipe_item: schema.object.optional().members({
    id: schema.number.optional(),
    recipe_id: schema.number([
      rules.exists({ table: 'recipes', column: 'id' })
    ]),
    quantity: schema.number([rules.unsigned()])
  })
})

export const StoreMealSchema = schema.create({
  meal_type: schema.string({ trim: true }, [
    rules.maxLength(255)
  ]),
  date_added: schema.date({
    format: 'yyyy-MM-dd',
  }),
  items: schema.array().members(mealItemSchema)
})

export const UpdateMealSchema = schema.create({
  meal_type: schema.string.optional({ trim: true }, [
    rules.maxLength(255)
  ]),
  date_added: schema.date.optional({
    format: 'yyyy-MM-dd',
  }),
  items: schema.array.optional().members(mealItemSchema)
})
