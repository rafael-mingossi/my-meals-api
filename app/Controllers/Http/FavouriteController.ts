import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FavouritesRepository from 'App/Repositories/FavouritesRepository'
import {AddFoodFavouriteSchema, AddRecipeFavouriteSchema} from "App/Validators/FavouriteValidator";

export default class FavouriteController {
  /**
   * Get all favorites for the authenticated user
   */
  public async index({ auth, response }: HttpContextContract) {
    try {
      const favoritesRepository = new FavouritesRepository()
      const favorites = await favoritesRepository.getUserFavourites(auth.user!.id)

      // Transform to a more convenient format
      const transformedFavourites = favorites.map(favorite => {
        if (favorite.food_id) {
          return {
            id: favorite.id,
            type: 'food',
            item: favorite.food
          }
        } else {
          return {
            id: favorite.id,
            type: 'recipe',
            item: favorite.recipe
          }
        }
      })

      return response.json(transformedFavourites)
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to fetch favorites',
        error: error.message
      })
    }
  }

  /**
   * Add a food to favorites
   */
  public async addFoodFavourite({ request, auth, response }: HttpContextContract) {
    try {
      // Validate request
      const { food_id } = await request.validate({
        schema: AddFoodFavouriteSchema
      })

      const favoritesRepository = new FavouritesRepository()

      // Check if already a favorite
      const isAlreadyFavourite = await favoritesRepository.isFoodFavourite(auth.user!.id, food_id)

      if (isAlreadyFavourite) {
        return response.status(400).json({
          message: 'Food is already in favorites'
        })
      }

      // Add to favorites
      const favorite = await favoritesRepository.addFoodFavourite(auth.user!.id, food_id)

      return response.status(201).json({
        message: 'Food added to favorites',
        favorite: {
          id: favorite.id,
          type: 'food',
          item: favorite.food
        }
      })
    } catch (error) {
      if (error.messages) {
        return response.status(422).json(error.messages)
      }

      return response.status(500).json({
        message: 'Failed to add food to favorites',
        error: error.message
      })
    }
  }

  /**
   * Add a recipe to favorites
   */
  public async addRecipeFavourite({ request, auth, response }: HttpContextContract) {
    try {
      // Validate request
      const { recipe_id } = await request.validate({
        schema: AddRecipeFavouriteSchema
      })

      const favoritesRepository = new FavouritesRepository()

      // Check if already a favorite
      const isAlreadyFavourite = await favoritesRepository.isRecipeFavourite(auth.user!.id, recipe_id)

      if (isAlreadyFavourite) {
        return response.status(400).json({
          message: 'Recipe is already in favorites'
        })
      }

      // Add to favorites
      const favorite = await favoritesRepository.addRecipeFavourite(auth.user!.id, recipe_id)

      return response.status(201).json({
        message: 'Recipe added to favorites',
        favorite: {
          id: favorite.id,
          type: 'recipe',
          item: favorite.recipe
        }
      })
    } catch (error) {
      if (error.messages) {
        return response.status(422).json(error.messages)
      }

      return response.status(500).json({
        message: 'Failed to add recipe to favorites',
        error: error.message
      })
    }
  }

  /**
   * Remove a food from favorites
   */
  public async removeFoodFavourite({ params, auth, response }: HttpContextContract) {
    try {
      const foodId = params.id

      const favoritesRepository = new FavouritesRepository()

      // Check if it's a favorite
      const isFavourite = await favoritesRepository.isFoodFavourite(auth.user!.id, foodId)

      if (!isFavourite) {
        return response.status(404).json({
          message: 'Food not found in favorites'
        })
      }

      // Remove from favorites
      await favoritesRepository.removeFoodFavourite(auth.user!.id, foodId)

      return response.json({
        message: 'Food removed from favorites'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to remove food from favorites',
        error: error.message
      })
    }
  }

  /**
   * Remove a recipe from favorites
   */
  public async removeRecipeFavourite({ params, auth, response }: HttpContextContract) {
    try {
      const recipeId = params.id

      const favoritesRepository = new FavouritesRepository()

      // Check if it's a favorite
      const isFavourite = await favoritesRepository.isRecipeFavourite(auth.user!.id, recipeId)

      if (!isFavourite) {
        return response.status(404).json({
          message: 'Recipe not found in favorites'
        })
      }

      // Remove from favorites
      await favoritesRepository.removeRecipeFavourite(auth.user!.id, recipeId)

      return response.json({
        message: 'Recipe removed from favorites'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to remove recipe from favorites',
        error: error.message
      })
    }
  }
}
