// app/Controllers/Http/FoodController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Food from 'App/Models/Food'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class FoodController {
  /**
   * Get all foods for the authenticated user
   * Excludes archived foods by default
   */
  public async index({ auth, request, response }: HttpContextContract) {
    try {
      const user = auth.user
      const { includeArchived = false, categoryId } = request.qs()

      const query = Food.query()
        .where('user_id', user?.id as string)

      // Filter by archived status if not explicitly including archived
      if (!includeArchived) {
        query.where('is_archived', false)
      }

      // Filter by category if provided
      if (categoryId) {
        query.where('category_id', categoryId)
      }

      const foods = await query.orderBy('label', 'asc')

      return response.json(foods)
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to fetch foods',
        error: error.message
      })
    }
  }

  /**
   * Get a specific food by ID
   */
  public async show({ params, auth, response }: HttpContextContract) {
    try {
      const food = await Food.query()
        .where('id', params.id)
        .where('user_id', auth.user?.id as string)
        .first()

      if (!food) {
        return response.status(404).json({
          message: 'Food not found'
        })
      }

      return response.json(food)
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to fetch food',
        error: error.message
      })
    }
  }

  /**
   * Create a new food
   */
  public async store({ request, auth, response }: HttpContextContract) {
    // Validate request
    const foodSchema = schema.create({
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

    try {
      const payload = await request.validate({ schema: foodSchema })

      // Create new food
      const food = new Food()
      food.user_id = auth.user!.id
      food.label = payload.label
      food.category_id = payload.category_id
      food.protein = payload.protein
      food.carbs = payload.carbs
      food.fat = payload.fat
      food.calories = payload.calories
      food.fibre = payload.fibre || null
      food.sodium = payload.sodium || null
      food.serv_size = payload.serv_size
      food.serv_unit = payload.serv_unit
      food.food_img = payload.food_img || null
      food.is_archived = false

      await food.save()

      return response.status(201).json(food)
    } catch (error) {
      if (error.messages) {
        return response.status(422).json(error.messages)
      }

      return response.status(500).json({
        message: 'Failed to create food',
        error: error.message
      })
    }
  }

  /**
   * Update an existing food
   */
  public async update({ params, request, auth, response }: HttpContextContract) {
    try {
      // Find the food
      const food = await Food.query()
        .where('id', params.id)
        .where('user_id', auth.user?.id as string)
        .first()

      if (!food) {
        return response.status(404).json({
          message: 'Food not found'
        })
      }

      // Validate request
      const foodSchema = schema.create({
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

      const payload = await request.validate({ schema: foodSchema })

      // Update food with new values
      food.merge(payload)
      await food.save()

      return response.json(food)
    } catch (error) {
      if (error.messages) {
        return response.status(422).json(error.messages)
      }

      return response.status(500).json({
        message: 'Failed to update food',
        error: error.message
      })
    }
  }

  /**
   * Archive a food (soft delete)
   */
  public async archive({ params, auth, response }: HttpContextContract) {
    try {
      // Find the food
      const food = await Food.query()
        .where('id', params.id)
        .where('user_id', auth.user?.id as string)
        .first()

      if (!food) {
        return response.status(404).json({
          message: 'Food not found'
        })
      }

      // Set is_archived to true
      food.is_archived = true
      await food.save()

      return response.json({
        message: 'Food archived successfully',
        food
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to archive food',
        error: error.message
      })
    }
  }

  /**
   * Restore an archived food
   */
  public async restore({ params, auth, response }: HttpContextContract) {
    try {
      // Find the food
      const food = await Food.query()
        .where('id', params.id)
        .where('user_id', auth.user?.id as string)
        .first()

      if (!food) {
        return response.status(404).json({
          message: 'Food not found'
        })
      }

      // Set is_archived to false
      food.is_archived = false
      await food.save()

      return response.json({
        message: 'Food restored successfully',
        food
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to restore food',
        error: error.message
      })
    }
  }
}
