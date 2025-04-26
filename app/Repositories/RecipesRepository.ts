import Recipe from 'App/Models/Recipe'
import RecipeItem from 'App/Models/RecipeItem'
import Food from 'App/Models/Food'
import { IRecipe } from 'App/Interfaces/IRecipe'
import Database from '@ioc:Adonis/Lucid/Database'
import { RecipeUtils } from 'App/Utils/RecipeUtils'
import BaseRepository from "App/Shared/Repositories/BaseRepository";

export default class RecipesRepository
  extends BaseRepository<typeof Recipe>
  implements IRecipe.Repository
{
  constructor() {
    super(Recipe)
  }
  /**
   * Get user's recipes with optional filtering
   */
  public async getUserRecipes(userId: string, options: {
    includeArchived?: boolean
  } = {}): Promise<Recipe[]> {
    const query = Recipe.query()
      .where('user_id', userId)
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('food')
      })

    if (!options.includeArchived) {
      query.where('is_archived', false)
    }

    return query.orderBy('name', 'asc')
  }

  /**
   * Find recipe by ID for a specific user
   */
  public async findById(id: number, userId: string): Promise<Recipe | null> {
    return Recipe.query()
      .where('id', id)
      .where('user_id', userId)
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('food')
      })
      .first()
  }

  /**
   * Store a new recipe with items
   */
  public async storeRecipe(data: IRecipe.DTOs.Store, userId: string): Promise<Recipe> {
    // Use transaction to ensure all operations succeed or fail together
    return Database.transaction(async (trx) => {
      // First, fetch all foods to calculate nutrition totals
      const foodIds = data.items.map(item => item.food_id)
      const foods = await Food.query({ client: trx })
        .whereIn('id', foodIds)

      // Calculate nutrition totals using the utility function
      const nutritionTotals = RecipeUtils.calculateNutritionTotals(
        foods,
        data.items
      )

      // Create recipe
      const recipe = new Recipe()
      recipe.useTransaction(trx)
      recipe.user_id = userId
      recipe.name = data.name
      recipe.t_calories = nutritionTotals.calories
      recipe.t_carbs = nutritionTotals.carbs
      recipe.t_fat = nutritionTotals.fat
      recipe.t_protein = nutritionTotals.protein
      recipe.t_fibre = nutritionTotals.fibre
      recipe.t_sodium = nutritionTotals.sodium
      recipe.serving = data.serving || null
      recipe.serv_unit = data.serv_unit || null
      recipe.img = data.img || null
      recipe.is_archived = false

      await recipe.save()

      // Create recipe items
      await Promise.all(
        data.items.map(async (item) => {
          const recipeItem = new RecipeItem()
          recipeItem.useTransaction(trx)
          recipeItem.recipe_id = recipe.id
          recipeItem.food_id = item.food_id
          recipeItem.quantity = item.quantity
          await recipeItem.save()
          return recipeItem
        })
      )

      // Load items with their foods for the return value
      await recipe.load('items', (query) => {
        query.preload('food')
      })

      return recipe
    })
  }

  /**
   * Update an existing recipe
   */
  public async update(recipe: Recipe, data: IRecipe.DTOs.Update): Promise<Recipe> {
    return Database.transaction(async (trx) => {
      // Update basic info if provided
      if (data.name !== undefined) recipe.name = data.name
      if (data.serving !== undefined) recipe.serving = data.serving
      if (data.serv_unit !== undefined) recipe.serv_unit = data.serv_unit
      if (data.img !== undefined) recipe.img = data.img

      recipe.useTransaction(trx)

      // If items are provided, update them
      if (data.items) {
        // Delete existing items
        await RecipeItem.query({ client: trx })
          .where('recipe_id', recipe.id)
          .delete()

        // Fetch foods for calculation
        const foodIds = data.items.map(item => item.food_id)
        const foods = await Food.query({ client: trx })
          .whereIn('id', foodIds)

        // Calculate new nutrition totals
        const nutritionTotals = RecipeUtils.calculateNutritionTotals(
          foods,
          data.items
        )

        // Update nutrition values
        recipe.t_calories = nutritionTotals.calories
        recipe.t_carbs = nutritionTotals.carbs
        recipe.t_fat = nutritionTotals.fat
        recipe.t_protein = nutritionTotals.protein
        recipe.t_fibre = nutritionTotals.fibre
        recipe.t_sodium = nutritionTotals.sodium

        // Create new recipe items
        await Promise.all(
          data.items.map(async (item) => {
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

      await recipe.save()

      // Reload with related data
      await recipe.load('items', (query) => {
        query.preload('food')
      })

      return recipe
    })
  }

  /**
   * Update recipe archive status
   */
  public async updateArchiveStatus(recipe: Recipe, isArchived: boolean): Promise<Recipe> {
    recipe.is_archived = isArchived
    await recipe.save()
    return recipe
  }

  /**
   * Get a list of Recipes in a Meal
   * @param recipeIds - array of Ids
   */
  public async getRecipesByIds(recipeIds:number[]): Promise<Recipe[] | null> {
    return Recipe.query().whereIn('id', recipeIds)
  }
}
