import 'App/Shared/Container/FoodContainer'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StoreFoodSchema, UpdateFoodSchema } from 'App/Validators/FoodValidator'
import FoodServices from 'App/Services/FoodServices'
import { container } from 'tsyringe'

export default class FoodController {
  private foodServices: FoodServices

  constructor() {
    this.foodServices = container.resolve(FoodServices)
  }

  /**
   * Get all foods for the authenticated user
   */
  public async index({ request, auth, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id!

      const includeArchived = request.input('include_archived', false)
      const categoryId = request.input('category_id')

      const foods = await this.foodServices.getUserFoods(
        userId,
        includeArchived,
        categoryId
      )

      return response.json(foods)
    } catch (error) {
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to fetch foods',
        error: error.message
      })
    }
  }

  /**
   * Get a specific food
   */
  public async show({ params, auth, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id!

      const food = await this.foodServices.getFood(params.id, userId)
      return response.json(food)
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
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
      const userId = auth.user?.id!

      const foodData = await request.validate({ schema: StoreFoodSchema })
      const food = await this.foodServices.store(foodData, userId)

      return response.status(201).json(food)
    } catch (error) {
      if (error.name === 'ValidationException') {
        return response.status(422).json(error.messages)
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to create food',
        error: error.message
      })
    }
  }

  /**
   * Update a food
   */
  public async update({ params, request, auth, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id!

      const foodData = await request.validate({ schema: UpdateFoodSchema })
      const food = await this.foodServices.update(params.id, userId, foodData)

      return response.json(food)
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      if (error.name === 'ValidationException') {
        return response.status(422).json(error.messages)
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to update food',
        error: error.message
      })
    }
  }

  /**
   * Archive a food
   */
  public async archive({ params, auth, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id!

      const food = await this.foodServices.updateArchiveStatus(params.id, userId, true)

      return response.json({
        message: 'Food archived successfully',
        food
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
      const userId = auth.user?.id!

      const food = await this.foodServices.updateArchiveStatus(params.id, userId, false)

      return response.json({
        message: 'Food restored successfully',
        food
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
        message: 'Failed to restore food',
        error: error.message
      })
    }
  }

  public async foodsByIds({ request, response }: HttpContextContract) {
    try {
      const { foodIds } = request.body()

      // Validate the input
      if (!Array.isArray(foodIds) || foodIds.length === 0) {
        return response.status(400).json({
          message: 'Invalid request. foodIds must be a non-empty array of numbers'
        })
      }

      const foods = await this.foodServices.getFoodsByIds(foodIds)
      return response.json(foods)
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to fetch foods',
        error: error.message
      })
    }
  }
}
