import { DateTime } from 'luxon'

export namespace IMeal {
  export namespace DTOs {
    export interface FoodItem {
      id?: number
      food_id: number
      quantity: number
    }

    export interface RecipeItem {
      id?: number
      recipe_id: number
      quantity: number
    }

    export interface MealItem {
      id?: number
      food_item?: FoodItem
      recipe_item?: RecipeItem
    }

    export interface Store {
      meal_type: string
      date_added: string | DateTime
      items: MealItem[]
    }

    export interface Update {
      meal_type?: string
      date_added?: string | DateTime
      items?: MealItem[]
    }

    export interface NutritionTotals {
      calories: number
      protein: number
      carbs: number
      fat: number
      fibre: number
      sodium: number
    }
  }
}
