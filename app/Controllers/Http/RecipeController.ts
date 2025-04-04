import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Recipe from 'App/Models/Recipe'
import RecipeItem from 'App/Models/RecipeItem'
import Food from 'App/Models/Food'
import Database from '@ioc:Adonis/Lucid/Database'
import { StoreRecipeSchema, UpdateRecipeSchema } from 'App/Validators/RecipeValidator'
import { IRecipe } from 'App/Interfaces/IRecipe'
import { RecipeUtils } from 'App/Utils/RecipeUtils'

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
    try {
      // Validate request using the schema and get typed DTO
      const recipeDto: IRecipe.DTOs.Store = await request.validate({
        schema: StoreRecipeSchema
      })

      // Use transaction to ensure all operations succeed or fail together
      const result = await Database.transaction(async (trx) => {
        // First, fetch all foods to calculate nutrition totals
        const foodIds = recipeDto.items.map(item => item.food_id)
        const foods = await Food.query({ client: trx })
          .whereIn('id', foodIds)

        // Calculate nutrition totals using the utility function
        const nutritionTotals = RecipeUtils.calculateNutritionTotals(
          foods,
          recipeDto.items
        )

        // Create recipe
        const recipe = new Recipe()
        recipe.useTransaction(trx)
        recipe.user_id = auth.user!.id
        recipe.name = recipeDto.name
        recipe.t_calories = nutritionTotals.calories
        recipe.t_carbs = nutritionTotals.carbs
        recipe.t_fat = nutritionTotals.fat
        recipe.t_protein = nutritionTotals.protein
        recipe.t_fibre = nutritionTotals.fibre
        recipe.t_sodium = nutritionTotals.sodium
        recipe.serving = recipeDto.serving || null
        recipe.serv_unit = recipeDto.serv_unit || null
        recipe.img = recipeDto.img || null
        recipe.is_archived = false

        await recipe.save()

        // Create recipe items
        const recipeItems = await Promise.all(
          recipeDto.items.map(async (item) => {
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
        .where('user_id', auth.user?.id as string)
        .preload('items')
        .first()

      if (!recipe) {
        return response.status(404).json({
          message: 'Recipe not found'
        })
      }

      // Validate request using the schema and get typed DTO
      const recipeDto: IRecipe.DTOs.Update = await request.validate({
        schema: UpdateRecipeSchema
      })

      // Use transaction for atomicity
      const result = await Database.transaction(async (trx) => {
        // Update recipe basic info (only the fields that are provided)
        if (recipeDto.name !== undefined) recipe.name = recipeDto.name
        if (recipeDto.serving !== undefined) recipe.serving = recipeDto.serving
        if (recipeDto.serv_unit !== undefined) recipe.serv_unit = recipeDto.serv_unit
        if (recipeDto.img !== undefined) recipe.img = recipeDto.img

        recipe.useTransaction(trx)

        // If items are provided, update them
        if (recipeDto.items) {
          // Delete existing items
          await RecipeItem.query({ client: trx })
            .where('recipe_id', recipe.id)
            .delete()

          // Get all foods needed for the calculation
          const foodIds = recipeDto.items.map(item => item.food_id)
          const foods = await Food.query({ client: trx })
            .whereIn('id', foodIds)

          // Calculate nutrition totals using the utility function
          const nutritionTotals = RecipeUtils.calculateNutritionTotals(
            foods,
            recipeDto.items
          )

          // Update recipe with new nutritional values
          recipe.t_calories = nutritionTotals.calories
          recipe.t_carbs = nutritionTotals.carbs
          recipe.t_fat = nutritionTotals.fat
          recipe.t_protein = nutritionTotals.protein
          recipe.t_fibre = nutritionTotals.fibre
          recipe.t_sodium = nutritionTotals.sodium

          // Create recipe items
          await Promise.all(
            recipeDto.items.map(async (item) => {
              const recipeItem = new RecipeItem()
              recipeItem.useTransaction(trx)
              recipeItem.recipe_id = recipe.id
              recipeItem.food_id = item.food_id
              recipeItem.quantity = item.quantity
              await recipeItem.save()
              return recipeItem
            })
          )
        }

        // Save the updated recipe
        await recipe.save()

        return recipe
      })

      // Reload the recipe with items and their foods for a complete response
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
