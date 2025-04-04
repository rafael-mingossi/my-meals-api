import Food from 'App/Models/Food'
import Recipe from 'App/Models/Recipe'
import { IMeal } from 'App/Interfaces/IMeal'

export class MealUtils {
  /**
   * Calculate nutrition totals for a meal based on its foods and recipes
   * @param foods List of Food objects used in the meal
   * @param recipes List of Recipe objects used in the meal
   * @param mealItems Array of meal items with quantities
   * @returns Object with calculated nutrition totals
   */
  public static calculateNutritionTotals(
    foods: Food[],
    recipes: Recipe[],
    mealItems: IMeal.DTOs.MealItem[]
  ): IMeal.DTOs.NutritionTotals {
    // Initialize totals
    let t_calories = 0
    let t_carbs = 0
    let t_fat = 0
    let t_protein = 0
    let t_fibre = 0
    let t_sodium = 0

    // Process food items
    mealItems.forEach(item => {
      if (item.food_item) {
        const food = foods.find(f => f.id === item.food_item?.food_id)
        if (food) {
          // Calculate the factor (how many servings)
          const factor = item.food_item.quantity / food.serv_size

          // Add scaled nutritional values to totals
          t_calories += food.calories * factor
          t_carbs += food.carbs * factor
          t_fat += food.fat * factor
          t_protein += food.protein * factor
          t_fibre += (food.fibre || 0) * factor
          t_sodium += (food.sodium || 0) * factor
        }
      }

      if (item.recipe_item) {
        const recipe = recipes.find(r => r.id === item.recipe_item?.recipe_id)
        if (recipe) {
          // For recipes, we assume the quantity is in number of servings
          const servings = item.recipe_item.quantity

          // Add scaled nutritional values to totals
          t_calories += recipe.t_calories * servings
          t_carbs += recipe.t_carbs * servings
          t_fat += recipe.t_fat * servings
          t_protein += recipe.t_protein * servings
          t_fibre += recipe.t_fibre * servings
          t_sodium += recipe.t_sodium * servings
        }
      }
    })

    // Round to 2 decimal places and convert to numbers
    return {
      calories: parseFloat(t_calories.toFixed(2)),
      carbs: parseFloat(t_carbs.toFixed(2)),
      fat: parseFloat(t_fat.toFixed(2)),
      protein: parseFloat(t_protein.toFixed(2)),
      fibre: parseFloat(t_fibre.toFixed(2)),
      sodium: parseFloat(t_sodium.toFixed(2))
    }
  }
}
