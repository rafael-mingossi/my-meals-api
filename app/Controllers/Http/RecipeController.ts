import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Recipe from 'App/Models/Recipe'
import RecipeItem from 'App/Models/RecipeItem'
import Food from 'App/Models/Food'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class RecipeController {
  /**
   * Get all recipes for the current user
   */
  public async index({ auth, request, response }: HttpContextContract) {
    try {
      const user = auth.user
      const { includeArchived = false } = request.qs()

      const query = Recipe.query()
        .where('user_id', user?.id as string)
        .preload('items', (itemsQuery) => {
          itemsQuery.preload('food')
        })

      // Filter by archived status if not explicitly including archived
      if (!includeArchived) {
        query.where('is_archived', false)
      }

      const recipes = await query.orderBy('name', 'asc')

      return response.json(recipes)
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to fetch recipes',
        error: error.message
      })
    }
  }

  /**
   * Get a specific recipe by ID
   */
  public async show({ params, auth, response }: HttpContextContract) {
    try {
      const recipe = await Recipe.query()
        .where('id', params.id)
        .where('user_id', auth.user?.id as string)
        .preload('items', (itemsQuery) => {
          itemsQuery.preload('food')
        })
        .first()

      if (!recipe) {
        return response.status(404).json({
          message: 'Recipe not found'
        })
      }

      return response.json(recipe)
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to fetch recipe',
        error: error.message
      })
    }
  }

  /**
   * Create a new recipe with items
   */
  public async store({ request, auth, response }: HttpContextContract) {
    // Validate request
    const recipeSchema = schema.create({
      name: schema.string({ trim: true }, [rules.maxLength(255)]),
      serving: schema.number.optional(),
      serv_unit: schema.string.optional({ trim: true }),
      img: schema.string.optional({ trim: true }),
      items: schema.array().members(
        schema.object().members({
          food_id: schema.number([
            rules.exists({ table: 'foods', column: 'id' })
          ]),
          quantity: schema.number([rules.unsigned()])
        })
      )
    })

    try {
      const payload = await request.validate({ schema: recipeSchema })

      // Use transaction to ensure all operations succeed or fail together
      const result = await Database.transaction(async (trx) => {
        // First, fetch all foods to calculate nutrition totals
        const foodIds = payload.items.map(item => item.food_id)
        const foods = await Food.query({ client: trx })
          .whereIn('id', foodIds)

        // Calculate nutrition totals
        let t_calories = 0
        let t_carbs = 0
        let t_fat = 0
        let t_protein = 0
        let t_fibre = 0
        let t_sodium = 0

        payload.items.forEach(item => {
          const food = foods.find(f => f.id === item.food_id)
          if (food) {
            const factor = item.quantity / food.serv_size
            t_calories += food.calories * factor
            t_carbs += food.carbs * factor
            t_fat += food.fat * factor
            t_protein += food.protein * factor
            t_fibre += (food.fibre || 0) * factor
            t_sodium += (food.sodium || 0) * factor
          }
        })

        // Create recipe
        const recipe = new Recipe()
        recipe.useTransaction(trx)
        recipe.user_id = auth.user!.id
        recipe.name = payload.name
        recipe.t_calories = parseFloat(t_calories.toFixed(2))
        recipe.t_carbs = parseFloat(t_carbs.toFixed(2))
        recipe.t_fat = parseFloat(t_fat.toFixed(2))
        recipe.t_protein = parseFloat(t_protein.toFixed(2))
        recipe.t_fibre = parseFloat(t_fibre.toFixed(2))
        recipe.t_sodium = parseFloat(t_sodium.toFixed(2))
        recipe.serving = payload.serving || null
        recipe.serv_unit = payload.serv_unit || null
        recipe.img = payload.img || null
        recipe.is_archived = false

        await recipe.save()

        // Create recipe items
        const recipeItems = await Promise.all(
          payload.items.map(async (item) => {
            const recipeItem = new RecipeItem()
            recipeItem.useTransaction(trx)
            recipeItem.recipe_id = recipe.id
            recipeItem.food_id = item.food_id
            recipeItem.quantity = item.quantity
            await recipeItem.save()
            return recipeItem
          })
        )

        return { recipe, recipeItems }
      })

      // Load associated items with their foods
      await result.recipe.load('items', (query) => {
        query.preload('food')
      })

      return response.status(201).json(result.recipe)
    } catch (error) {
      if (error.messages) {
        return response.status(422).json(error.messages)
      }

      return response.status(500).json({
        message: 'Failed to create recipe',
        error: error.message
      })
    }
  }

  /**
   * Update an existing recipe
   */
  public async update({ params, request, auth, response }: HttpContextContract) {
    try {
      // Find the recipe
      const recipe = await Recipe.query()
        .where('id', params.id)
        .where('user_id', auth.user?.id  as string)
        .preload('items')
        .first()

      if (!recipe) {
        return response.status(404).json({
          message: 'Recipe not found'
        })
      }

      // Validate request
      const recipeSchema = schema.create({
        name: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
        serving: schema.number.optional(),
        serv_unit: schema.string.optional({ trim: true }),
        img: schema.string.optional({ trim: true }),
        items: schema.array.optional().members(
          schema.object().members({
            id: schema.number.optional(),
            food_id: schema.number([
              rules.exists({ table: 'foods', column: 'id' })
            ]),
            quantity: schema.number([rules.unsigned()])
          })
        )
      })

      const payload = await request.validate({ schema: recipeSchema })

      // Use transaction for atomicity
      const result = await Database.transaction(async (trx) => {
        // Update recipe basic info
        if (payload.name) recipe.name = payload.name
        if (payload.serving !== undefined) recipe.serving = payload.serving
        if (payload.serv_unit !== undefined) recipe.serv_unit = payload.serv_unit
        if (payload.img !== undefined) recipe.img = payload.img

        recipe.useTransaction(trx)

        // If items are provided, update them
        if (payload.items) {
          // Delete existing items
          await RecipeItem.query({ client: trx })
            .where('recipe_id', recipe.id)
            .delete()

          // Create new items
          const foodIds = payload.items.map(item => item.food_id)
          const foods = await Food.query({ client: trx })
            .whereIn('id', foodIds)

          // Create recipe items
          await Promise.all(
            payload.items.map(async (item) => {
              const recipeItem = new RecipeItem()
              recipeItem.useTransaction(trx)
              recipeItem.recipe_id = recipe.id
              recipeItem.food_id = item.food_id
              recipeItem.quantity = item.quantity
              await recipeItem.save()
              return recipeItem
            })
          )

          // Recalculate nutrition totals
          let t_calories = 0
          let t_carbs = 0
          let t_fat = 0
          let t_protein = 0
          let t_fibre = 0
          let t_sodium = 0

          payload.items.forEach(item => {
            const food = foods.find(f => f.id === item.food_id)
            if (food) {
              const factor = item.quantity / food.serv_size
              t_calories += food.calories * factor
              t_carbs += food.carbs * factor
              t_fat += food.fat * factor
              t_protein += food.protein * factor
              t_fibre += (food.fibre || 0) * factor
              t_sodium += (food.sodium || 0) * factor
            }
          })

          recipe.t_calories = parseFloat(t_calories.toFixed(2))
          recipe.t_carbs = parseFloat(t_carbs.toFixed(2))
          recipe.t_fat = parseFloat(t_fat.toFixed(2))
          recipe.t_protein = parseFloat(t_protein.toFixed(2))
          recipe.t_fibre = parseFloat(t_fibre.toFixed(2))
          recipe.t_sodium = parseFloat(t_sodium.toFixed(2))
        }

        await recipe.save()

        return recipe
      })

      // Reload the recipe with items
      await result.load('items', (query) => {
        query.preload('food')
      })

      return response.json(result)
    } catch (error) {
      if (error.messages) {
        return response.status(422).json(error.messages)
      }

      return response.status(500).json({
        message: 'Failed to update recipe',
        error: error.message
      })
    }
  }

  /**
   * Archive a recipe (soft delete)
   */
  public async archive({ params, auth, response }: HttpContextContract) {
    try {
      // Find the recipe
      const recipe = await Recipe.query()
        .where('id', params.id)
        .where('user_id', auth.user?.id as string)
        .first()

      if (!recipe) {
        return response.status(404).json({
          message: 'Recipe not found'
        })
      }

      // Set is_archived to true
      recipe.is_archived = true
      await recipe.save()

      return response.json({
        message: 'Recipe archived successfully',
        recipe
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to archive recipe',
        error: error.message
      })
    }
  }

  /**
   * Restore an archived recipe
   */
  public async restore({ params, auth, response }: HttpContextContract) {
    try {
      // Find the recipe
      const recipe = await Recipe.query()
        .where('id', params.id)
        .where('user_id', auth.user?.id as string)
        .first()

      if (!recipe) {
        return response.status(404).json({
          message: 'Recipe not found'
        })
      }

      // Set is_archived to false
      recipe.is_archived = false
      await recipe.save()

      return response.json({
        message: 'Recipe restored successfully',
        recipe
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to restore recipe',
        error: error.message
      })
    }
  }
}
