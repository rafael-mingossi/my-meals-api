import {inject, injectable} from 'tsyringe'
import Meal from 'App/Models/Meal'
import {IMeal} from 'App/Interfaces/IMeal'
import NotFoundException from 'App/Shared/Exceptions/NotFoundException'
import { DateTime } from 'luxon'

@injectable()
export default class MealServices {
  constructor(
    @inject('MealsRepository')
    private mealsRepository: IMeal.Repository
  ) {}

  /**
   * Get all meals for a user with optional filtering
   */
  public async getUserMeals(userId: string, options: {
    date?: string | DateTime,
    startDate?: string | DateTime,
    endDate?: string | DateTime,
    mealType?: string
  } = {}): Promise<Meal[]> {
    return this.mealsRepository.getUserMeals(userId, options)
  }

  /**
   * Get meal by ID
   */
  public async getMeal(id: number, userId: string): Promise<Meal> {
    const meal = await this.mealsRepository.findById(id, userId)

    if (!meal) {
      throw new NotFoundException('Meal not found or not available.')
    }

    return meal
  }

  /**
   * Create new meal
   */
  public async store(data: IMeal.DTOs.Store, userId: string): Promise<Meal> {
    return this.mealsRepository.storeMeal(data, userId)
  }

  /**
   * Update meal
   */
  public async update(id: number, userId: string, data: IMeal.DTOs.Update): Promise<Meal> {
    const meal = await this.mealsRepository.findById(id, userId)

    if (!meal) {
      throw new NotFoundException('Meal not found or not available.')
    }

    return this.mealsRepository.update(meal, data)
  }

  /**
   * Delete meal
   */
  public async delete(id: number, userId: string): Promise<void> {
    const meal = await this.mealsRepository.findById(id, userId)

    if (!meal) {
      throw new NotFoundException('Meal not found or not available.')
    }

    return this.mealsRepository.delete(meal)
  }

  /**
   * Get nutrition summary for date range
   */
  public async getNutritionSummary(userId: string, startDate: DateTime, endDate: DateTime): Promise<Record<string, any>> {
    // Get meals in date range
    const meals = await this.mealsRepository.getUserMeals(userId, {
      startDate,
      endDate
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

    return {
      summary: summaryByDate,
      dateRange: {
        start: startDate.toFormat('yyyy-MM-dd'),
        end: endDate.toFormat('yyyy-MM-dd')
      }
    }
  }

  /**
   * Get all meals for a user on a specific date
   */
  public async getUserMealsByDate(userId: string, date: string | DateTime): Promise<Meal[]> {
    return this.mealsRepository.getUserMeals(userId, { date })
  }
}
