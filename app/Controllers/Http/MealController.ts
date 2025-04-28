import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StoreMealSchema, UpdateMealSchema } from 'App/Validators/MealValidator'
import MealServices from 'App/Services/MealServices'
import { container } from 'tsyringe'
import { DateTime } from 'luxon'
import 'App/Shared/Container/MealContainer'

export default class MealController {
  private mealServices: MealServices

  constructor() {
    this.mealServices = container.resolve(MealServices)
  }

  /**
   * Get meals for the authenticated user
   * Can be filtered by date, date range, and meal type
   */
  public async index({ auth, request, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id as string
      const { date, startDate, endDate, mealType } = request.qs()

      const meals = await this.mealServices.getUserMeals(userId, {
        date,
        startDate,
        endDate,
        mealType
      })

      return response.json(meals)
    } catch (error) {
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to fetch meals',
        error: error.message
      })
    }
  }

  /**
   * Get a specific meal by ID
   */
  public async show({ params, auth, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id as string

      const meal = await this.mealServices.getMeal(params.id, userId)
      return response.json(meal)
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to fetch meal',
        error: error.message
      })
    }
  }

  /**
   * Create a new meal with items
   */
  public async store({ request, auth, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id as string

      const mealData = await request.validate({
        schema: StoreMealSchema
      })

      const meal = await this.mealServices.store(mealData, userId)

      return response.status(201).json(meal)
    } catch (error) {
      if (error.messages) {
        return response.status(422).json(error.messages)
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to create meal',
        error: error.message
      })
    }
  }

  /**
   * Update an existing meal
   */
  public async update({ params, request, auth, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id as string

      const mealData = await request.validate({
        schema: UpdateMealSchema
      })

      const meal = await this.mealServices.update(params.id, userId, mealData)

      return response.json(meal)
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
        message: 'Failed to update meal',
        error: error.message
      })
    }
  }

  /**
   * Delete a meal and its items
   */
  public async destroy({ params, auth, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id as string

      await this.mealServices.delete(params.id, userId)

      return response.json({
        message: 'Meal deleted successfully'
      })
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to delete meal',
        error: error.message
      })
    }
  }

  /**
   * Get nutrition summary for a date range
   */
  public async getNutritionSummary({ auth, request, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id as string
      const { startDate, endDate } = request.qs()

      if (!startDate || !endDate) {
        return response.status(400).json({
          message: 'Start date and end date are required'
        })
      }

      // Convert strings to DateTime objects
      const start = DateTime.fromISO(startDate)
      const end = DateTime.fromISO(endDate)

      if (!start.isValid || !end.isValid) {
        return response.status(400).json({
          message: 'Invalid date format. Use ISO format (e.g. 2023-01-01)'
        })
      }

      const summary = await this.mealServices.getNutritionSummary(userId, start, end)

      return response.json(summary)
    } catch (error) {
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to get nutrition summary',
        error: error.message
      })
    }
  }

  /**
   * Get all meals for the authenticated user on a specific date
   */
  public async getByDate({ auth, params, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id as string
      const { date } = params

      // Validate date format
      const dateTime = DateTime.fromISO(date)
      if (!dateTime.isValid) {
        return response.status(400).json({
          message: 'Invalid date format. Use ISO format (e.g. 2023-01-01)'
        })
      }

      const meals = await this.mealServices.getUserMealsByDate(userId, dateTime)

      return response.json(meals)
    } catch (error) {
      if (error.name === 'UnauthorizedException') {
        return response.status(401).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to fetch meals for the specified date',
        error: error.message
      })
    }
  }
}
