import { schema, rules } from '@ioc:Adonis/Core/Validator'

const recipeItemSchema = schema.object().members({
  id: schema.number.optional(),
  food_id: schema.number([
    rules.exists({ table: 'foods', column: 'id' })
  ]),
  quantity: schema.number([rules.unsigned()])
})

export const StoreRecipeSchema = schema.create({
  name: schema.string({ trim: true }, [rules.maxLength(255)]),
  serving: schema.number.optional(),
  serv_unit: schema.string.optional({ trim: true }),
  img: schema.string.optional({ trim: true }),
  items: schema.array().members(recipeItemSchema)
})

export const UpdateRecipeSchema = schema.create({
  name: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
  serving: schema.number.optional(),
  serv_unit: schema.string.optional({ trim: true }),
  img: schema.string.optional({ trim: true }),
  items: schema.array.optional().members(recipeItemSchema)
})
