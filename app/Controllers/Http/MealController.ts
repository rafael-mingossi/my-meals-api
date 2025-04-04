import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StoreMealSchema, UpdateMealSchema } from 'App/Validators/MealValidator'
import { IMeal } from 'App/Interfaces/IMeal'
import MealsRepository from 'App/Repositories/MealsRepository'
import { DateTime } from 'luxon'

export default class MealController {
  /**
   * Get meals for the authenticated user
   * Can be filtered by date, date range, and meal type
   */
  public async index({ auth, request, response }: HttpContextContract) {
    try {
      const { date, startDate, endDate, mealType } = request.qs()

      const mealsRepository = new MealsRepository()
      const meals = await mealsRepository.getUserMeals(auth.user!.id, {
        date,
        startDate,
        endDate,
        mealType
      })

      return response.json(meals)
    } catch (error) {
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
      const mealsRepository = new MealsRepository()
      const meal = await mealsRepository.findById(params.id, auth.user!.id)

      if (!meal) {
        return response.status(404).json({
          message: 'Meal not found'
        })
      }

      return response.json(meal)
    } catch (error) {
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
      // Validate request and get typed DTO
      const mealDto: IMeal.DTOs.Store = await request.validate({
        schema: StoreMealSchema
      })

      // Store meal through repository
      const mealsRepository = new MealsRepository()
      const meal = await mealsRepository.store(mealDto, auth.user!.id)

      return response.status(201).json(meal)
    } catch (error) {
      if (error.messages) {
        return response.status(422).json(error.messages)
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
      // Validate request and get typed DTO
      const mealDto: IMeal.DTOs.Update = await request.validate({
        schema: UpdateMealSchema
      })

      // Find the meal
      const mealsRepository = new MealsRepository()
      const meal = await mealsRepository.findById(params.id, auth.user!.id)

      if (!meal) {
        return response.status(404).json({
          message: 'Meal not found'
        })
      }

      // Update through repository
      const updatedMeal = await mealsRepository.update(meal, mealDto)

      return response.json(updatedMeal)
    } catch (error) {
      if (error.messages) {
        return response.status(422).json(error.messages)
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
      // Find the meal
      const mealsRepository = new MealsRepository()
      const meal = await mealsRepository.findById(params.id, auth.user!.id)

      if (!meal) {
        return response.status(404).json({
          message: 'Meal not found'
        })
      }

      // Delete through repository
      await mealsRepository.delete(meal)

      return response.json({
        message: 'Meal deleted successfully'
      })
    } catch (error) {
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

      // Get meals in date range
      const mealsRepository = new MealsRepository()
      const meals = await mealsRepository.getUserMeals(auth.user!.id, {
        startDate: start,
        endDate: end
      })

      // Group meals by date
      const mealsByDate = meals.reduce((acc, meal) => {
        const dateStr = meal.date_added.toFormat('yyyy-MM-dd')

        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fibre: 0,
            sodium: 0,
            meals: []
          }
        }

        // Add nutrition data
        acc[dateStr].calories += meal.t_calories
        acc[dateStr].protein += meal.t_protein
        acc[dateStr].carbs += meal.t_carbs
        acc[dateStr].fat += meal.t_fat
        acc[dateStr].fibre += meal.t_fibre
        acc[dateStr].sodium += meal.t_sodium

        // Add meal type to the list
        acc[dateStr].meals.push({
          id: meal.id,
          type: meal.meal_type,
          calories: meal.t_calories,
          protein: meal.t_protein,
          carbs: meal.t_carbs,
          fat: meal.t_fat
        })

        return acc
      }, {} as Record<string, any>)

      // Convert to array and sort by date
      const summaryByDate = Object.values(mealsByDate).sort((a, b) =>
        DateTime.fromISO(a.date) < DateTime.fromISO(b.date) ? -1 : 1
      )

      return response.json({
        summary: summaryByDate,
        dateRange: {
          start: start.toFormat('yyyy-MM-dd'),
          end: end.toFormat('yyyy-MM-dd')
        }
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to get nutrition summary',
        error: error.message
      })
    }
  }
}
