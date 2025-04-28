import BaseRepository from 'App/Shared/Repositories/BaseRepository'
import Meal from 'App/Models/Meal'
import MealItem from 'App/Models/MealItem'
import Food from 'App/Models/Food'
import Recipe from 'App/Models/Recipe'
import { IMeal } from 'App/Interfaces/IMeal'
import Database from '@ioc:Adonis/Lucid/Database'
import { MealUtils } from 'App/Utils/MealUtils'
import { DateTime } from 'luxon'

export default class MealsRepository
  extends BaseRepository<typeof Meal>
  implements IMeal.Repository
{
  constructor() {
    super(Meal)
  }

  /**
   * Get user's meals for a specific date or date range
   */
  public async getUserMeals(userId: string, options: {
    date?: string | DateTime,
    startDate?: string | DateTime,
    endDate?: string | DateTime,
    mealType?: string
  } = {}): Promise<Meal[]> {
    const query = Meal.query()
      .where('user_id', userId)
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('food')
        itemsQuery.preload('recipe')
      })

    // Filter by single date if provided
    if (options.date) {
      const date = options.date instanceof DateTime
        ? options.date.toFormat('yyyy-MM-dd')
        : options.date

      query.where('date_added', date)
    }

    // Filter by date range if provided
    if (options.startDate && options.endDate) {
      const startDate = options.startDate instanceof DateTime
        ? options.startDate.toFormat('yyyy-MM-dd')
        : options.startDate

      const endDate = options.endDate instanceof DateTime
        ? options.endDate.toFormat('yyyy-MM-dd')
        : options.endDate

      query.whereBetween('date_added', [startDate, endDate])
    }

    // Filter by meal type if provided
    if (options.mealType) {
      query.where('meal_type', options.mealType)
    }

    return query
      .orderBy('date_added', 'desc')
      .orderBy('created_at', 'desc')
  }

  /**
   * Find meal by ID for a specific user
   */
  public async findById(id: number, userId: string): Promise<Meal | null> {
    return Meal.query()
      .where('id', id)
      .where('user_id', userId)
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('food')
        itemsQuery.preload('recipe')
      })
      .first()
  }

  /**
   * Store a new meal with items
   */
  public async storeMeal(data: IMeal.DTOs.Store, userId: string): Promise<Meal> {
    return Database.transaction(async (trx) => {
      // Create meal first
      const meal = new Meal()
      meal.useTransaction(trx)
      meal.user_id = userId
      meal.meal_type = data.meal_type
      meal.date_added = data.date_added instanceof DateTime
        ? data.date_added
        : DateTime.fromISO(data.date_added)

      // Initialize nutrition totals to 0
      meal.t_calories = 0
      meal.t_carbs = 0
      meal.t_fat = 0
      meal.t_protein = 0
      meal.t_fibre = 0
      meal.t_sodium = 0

      await meal.save()

      // Prepare to fetch foods and recipes
      const foodIds: number[] = []
      const recipeIds: number[] = []

      data.items.forEach(item => {
        if (item.food_item) {
          foodIds.push(item.food_item.food_id)
        }
        if (item.recipe_item) {
          recipeIds.push(item.recipe_item.recipe_id)
        }
      })

      // Fetch all needed foods and recipes
      const foods = foodIds.length > 0
        ? await Food.query({ client: trx }).whereIn('id', foodIds)
        : []

      const recipes = recipeIds.length > 0
        ? await Recipe.query({ client: trx }).whereIn('id', recipeIds)
        : []

      // Create meal items
      await Promise.all(
        data.items.map(async (item) => {
          const mealItem = new MealItem()
          mealItem.useTransaction(trx)
          mealItem.meal_id = meal.id

          if (item.food_item) {
            mealItem.food_id = item.food_item.food_id
            mealItem.food_quantity = item.food_item.quantity
            mealItem.recipe_id = null
            mealItem.recipe_quantity = null
          } else if (item.recipe_item) {
            mealItem.recipe_id = item.recipe_item.recipe_id
            mealItem.recipe_quantity = item.recipe_item.quantity
            mealItem.food_id = null
            mealItem.food_quantity = null
          }

          await mealItem.save()
          return mealItem
        })
      )

      // Calculate nutrition totals
      const nutritionTotals = MealUtils.calculateNutritionTotals(
        foods,
        recipes,
        data.items
      )

      // Update meal with nutrition totals
      meal.t_calories = nutritionTotals.calories
      meal.t_carbs = nutritionTotals.carbs
      meal.t_fat = nutritionTotals.fat
      meal.t_protein = nutritionTotals.protein
      meal.t_fibre = nutritionTotals.fibre
      meal.t_sodium = nutritionTotals.sodium

      await meal.save()

      // Load items with their related models for the return value
      await meal.load('items', (query) => {
        query.preload('food')
        query.preload('recipe')
      })

      return meal
    })
  }

  /**
   * Update an existing meal
   */
  public async update(meal: Meal, data: IMeal.DTOs.Update): Promise<Meal> {
    return Database.transaction(async (trx) => {
      // Update basic info if provided
      if (data.meal_type !== undefined) meal.meal_type = data.meal_type
      if (data.date_added !== undefined) {
        meal.date_added = data.date_added instanceof DateTime
          ? data.date_added
          : DateTime.fromISO(data.date_added)
      }

      meal.useTransaction(trx)

      // If items are provided, update them
      if (data.items) {
        // Delete existing items
        await MealItem.query({ client: trx })
          .where('meal_id', meal.id)
          .delete()

        // Prepare to fetch foods and recipes
        const foodIds: number[] = []
        const recipeIds: number[] = []

        data.items.forEach(item => {
          if (item.food_item) {
            foodIds.push(item.food_item.food_id)
          }
          if (item.recipe_item) {
            recipeIds.push(item.recipe_item.recipe_id)
          }
        })

        // Fetch all needed foods and recipes
        const foods = foodIds.length > 0
          ? await Food.query({ client: trx }).whereIn('id', foodIds)
          : []

        const recipes = recipeIds.length > 0
          ? await Recipe.query({ client: trx }).whereIn('id', recipeIds)
          : []

        // Create meal items
        await Promise.all(
          data.items.map(async (item) => {
            const mealItem = new MealItem()
            mealItem.useTransaction(trx)
            mealItem.meal_id = meal.id

            if (item.food_item) {
              mealItem.food_id = item.food_item.food_id
              mealItem.food_quantity = item.food_item.quantity
              mealItem.recipe_id = null
              mealItem.recipe_quantity = null
            } else if (item.recipe_item) {
              mealItem.recipe_id = item.recipe_item.recipe_id
              mealItem.recipe_quantity = item.recipe_item.quantity
              mealItem.food_id = null
              mealItem.food_quantity = null
            }

            await mealItem.save()
            return mealItem
          })
        )

        // Calculate nutrition totals
        const nutritionTotals = MealUtils.calculateNutritionTotals(
          foods,
          recipes,
          data.items
        )

        // Update meal with nutrition totals
        meal.t_calories = nutritionTotals.calories
        meal.t_carbs = nutritionTotals.carbs
        meal.t_fat = nutritionTotals.fat
        meal.t_protein = nutritionTotals.protein
        meal.t_fibre = nutritionTotals.fibre
        meal.t_sodium = nutritionTotals.sodium
      }

      await meal.save()

      // Reload with related data
      await meal.load('items', (query) => {
        query.preload('food')
        query.preload('recipe')
      })

      return meal
    })
  }

  /**
   * Delete a meal and its items
   */
  public async delete(meal: Meal): Promise<void> {
    return Database.transaction(async (trx) => {
      meal.useTransaction(trx)

      // Delete all meal items first
      await MealItem.query({ client: trx })
        .where('meal_id', meal.id)
        .delete()

      // Then delete the meal
      await meal.delete()
    })
  }

  /**
   * Delete all meals of a specific type on a specific date
   */
  public async deleteMealsByTypeAndDate(
    userId: string,
    date: string | DateTime,
    mealType: string
  ): Promise<void> {
    return Database.transaction(async (trx) => {
      // Format date to string if it's a DateTime object
      const formattedDate = date instanceof DateTime
        ? date.toFormat('yyyy-MM-dd')
        : date;

      // Find meals matching criteria
      const meals = await Meal.query({ client: trx })
        .where('user_id', userId)
        .where('date_added', formattedDate)
        .where('meal_type', mealType);

      if (meals.length === 0) {
        return;
      }

      const mealIds = meals.map(meal => meal.id);

      // Delete all related meal items first (foreign key constraint)
      await MealItem.query({ client: trx })
        .whereIn('meal_id', mealIds)
        .delete();

      // Then delete the meals
      await Meal.query({ client: trx })
        .whereIn('id', mealIds)
        .delete();
    });
  }

  /**
   * Delete a specific meal item and update meal totals or delete meal if it's the last item
   */
  public async deleteMealItemById(
    id: number,
    userId: string
  ): Promise<{ userId: string, dateAdded: DateTime }> {
    return Database.transaction(async (trx) => {
      // Find the meal item and ensure it belongs to the user
      const mealItem = await MealItem.query({ client: trx })
        .where('id', id)
        .firstOrFail();

      // Load the parent meal to check ownership
      const meal = await Meal.query({ client: trx })
        .where('id', mealItem.meal_id)
        .firstOrFail();

      const mealId = mealItem.meal_id;
      const dateAdded = meal.date_added;

      // Delete the meal item
      await mealItem.useTransaction(trx).delete();

      // Get remaining meal items for this meal
      const remainingItems = await MealItem.query({ client: trx })
        .where('meal_id', mealId)
        .preload('food')
        .preload('recipe');

      // If there are no remaining items, delete the meal
      if (remainingItems.length === 0) {
        await meal.useTransaction(trx).delete();
      } else {
        // Calculate new nutrition totals
        const foods = remainingItems
          .filter(item => item.food)
          .map(item => item.food);

        const recipes = remainingItems
          .filter(item => item.recipe)
          .map(item => item.recipe);

        // Convert to MealItem DTO format for the utility function
        const mealItemsDTO = remainingItems.map(item => {
          return {
            id: item.id,
            food_item: item.food_id ? {
              food_id: item.food_id,
              quantity: item.food_quantity || 0
            } : undefined,
            recipe_item: item.recipe_id ? {
              recipe_id: item.recipe_id,
              quantity: item.recipe_quantity || 0
            } : undefined
          };
        });

        const nutritionTotals = MealUtils.calculateNutritionTotals(
          foods,
          recipes,
          mealItemsDTO
        );

        // Update meal with new totals
        meal.t_calories = nutritionTotals.calories;
        meal.t_carbs = nutritionTotals.carbs;
        meal.t_fat = nutritionTotals.fat;
        meal.t_protein = nutritionTotals.protein;
        meal.t_fibre = nutritionTotals.fibre;
        meal.t_sodium = nutritionTotals.sodium;

        await meal.useTransaction(trx).save();
      }

      return { userId, dateAdded };
    });
  }
}
