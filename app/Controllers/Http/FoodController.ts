import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Food from 'App/Models/Food'
import { StoreFoodSchema, UpdateFoodSchema } from 'App/Validators/FoodValidator'
import { IFood } from 'App/Interfaces/IFood'
import FoodsRepository from "App/Repositories/FoodsRepository";

export default class FoodController {
  /**
   * Get all foods for the authenticated user
   * Excludes archived foods by default
   */
  public async index({ auth, request, response }: HttpContextContract) {
    try {
      const { includeArchived = false, categoryId } = request.qs()

      const foodsRepository = new FoodsRepository()
      const foods = await foodsRepository.getUserFoods(auth.user!.id, {
        includeArchived: includeArchived,
        categoryId: categoryId
      })

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
    try {
      const foodDto: IFood.DTOs.Store = await request.validate({ schema: StoreFoodSchema })

      const foodsRepository = new FoodsRepository()
      const food = await foodsRepository.store(foodDto, auth.user!.id)

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

      // Validate request using the schema and get typed DTO
      const foodDto: IFood.DTOs.Update = await request.validate({ schema: UpdateFoodSchema })

      // Update food with new values
      food.merge(foodDto)
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
