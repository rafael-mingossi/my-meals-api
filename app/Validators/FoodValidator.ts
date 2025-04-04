import { schema, rules } from '@ioc:Adonis/Core/Validator'

export const StoreFoodSchema = schema.create({
  label: schema.string({ trim: true }, [rules.maxLength(255)]),
  category_id: schema.number([
    rules.exists({ table: 'food_categories', column: 'id' })
  ]),
  protein: schema.number(),
  carbs: schema.number(),
  fat: schema.number(),
  calories: schema.number(),
  fibre: schema.number.optional(),
  sodium: schema.number.optional(),
  serv_size: schema.number(),
  serv_unit: schema.string({ trim: true }),
  food_img: schema.string.optional({ trim: true })
})

export const UpdateFoodSchema = schema.create({
  label: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
  category_id: schema.number.optional([
    rules.exists({ table: 'food_categories', column: 'id' })
  ]),
  protein: schema.number.optional(),
  carbs: schema.number.optional(),
  fat: schema.number.optional(),
  calories: schema.number.optional(),
  fibre: schema.number.optional(),
  sodium: schema.number.optional(),
  serv_size: schema.number.optional(),
  serv_unit: schema.string.optional({ trim: true }),
  food_img: schema.string.optional({ trim: true })
})
