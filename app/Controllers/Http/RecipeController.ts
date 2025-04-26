import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StoreRecipeSchema, UpdateRecipeSchema } from 'App/Validators/RecipeValidator'
import RecipeServices from 'App/Services/RecipeServices'
import { container } from 'tsyringe'
import 'App/Shared/Container/RecipeContainer'

export default class RecipeController {
  private recipeServices: RecipeServices

  constructor() {
    this.recipeServices = container.resolve(RecipeServices)
  }

  /**
   * Get all recipes for the current user
   */
  public async index({ auth, request, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id as string
      const includeArchived = request.input('include_archived', false)

      const recipes = await this.recipeServices.getUserRecipes(userId, includeArchived)

      return response.json(recipes)
    } catch (error) {
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
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
      const userId = auth.user?.id as string

      const recipe = await this.recipeServices.getRecipe(params.id, userId)
      return response.json(recipe)
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
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
      const userId = auth.user?.id as string

      const recipeData = await request.validate({
        schema: StoreRecipeSchema
      })

      const recipe = await this.recipeServices.store(recipeData, userId)

      return response.status(201).json(recipe)
    } catch (error) {
      if (error.messages) {
        return response.status(422).json(error.messages)
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
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
      const userId = auth.user?.id as string

      const recipeData = await request.validate({
        schema: UpdateRecipeSchema
      })

      const recipe = await this.recipeServices.update(params.id, userId, recipeData)

      return response.json(recipe)
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      if (error.messages) {
        return response.status(422).json(error.messages)
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
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
      const userId = auth.user?.id as string

      const recipe = await this.recipeServices.updateArchiveStatus(params.id, userId, true)

      return response.json({
        message: 'Recipe archived successfully',
        recipe
      })
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      if (error.name === 'BadRequestException') {
        return response.status(400).json({ message: error.message })
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
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
      const userId = auth.user?.id as string

      const recipe = await this.recipeServices.updateArchiveStatus(params.id, userId, false)

      return response.json({
        message: 'Recipe restored successfully',
        recipe
      })
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      if (error.name === 'BadRequestException') {
        return response.status(400).json({ message: error.message })
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to restore recipe',
        error: error.message
      })
    }
  }

  public async recipesByIds({ request, response }: HttpContextContract){
    try {
      const {recipeIds} = request.body();

      // Validate the input
      if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
        return response.status(400).json({
          message: 'Invalid request. recipeIds must be a non-empty array of numbers'
        })
      }

      const recipes = await this.recipeServices.getRecipesByIds(recipeIds);

      return response.json(recipes)

    }catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to fetch recipes',
        error: error.message
      })
    }
  }
}
