import Food from 'App/Models/Food'
import { IRecipe } from 'App/Interfaces/IRecipe'

export class RecipeUtils {
  /**
   * Calculate nutrition totals for a recipe based on its items and food data
   * @param foods List of Food objects used in the recipe
   * @param items Recipe items with quantities
   * @returns Object with calculated nutrition totals
   */
  public static calculateNutritionTotals(
    foods: Food[],
    items: { food_id: number; quantity: number }[]
  ): IRecipe.DTOs.NutritionTotals {
    // Initialize totals
    let t_calories = 0
    let t_carbs = 0
    let t_fat = 0
    let t_protein = 0
    let t_fibre = 0
    let t_sodium = 0

    // Calculate totals based on serving sizes and quantities
    items.forEach(item => {
      const food = foods.find(f => f.id === item.food_id)
      if (food) {
        // Calculate the factor (how many servings)
        const factor = item.quantity / food.serv_size

        // Add scaled nutritional values to totals
        t_calories += food.calories * factor
        t_carbs += food.carbs * factor
        t_fat += food.fat * factor
        t_protein += food.protein * factor
        t_fibre += (food.fibre || 0) * factor
        t_sodium += (food.sodium || 0) * factor
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
