import BaseInterface from "App/Shared/Interfaces/BaseInterface";
import Meal from 'App/Models/Meal'
import { DateTime } from 'luxon'

export namespace IMeal {
  export interface Repository extends BaseInterface<typeof Meal>, Helpers {
    getUserMeals(userId: string, options?: {
      date?: string | DateTime,
      startDate?: string | DateTime,
      endDate?: string | DateTime,
      mealType?: string
    }): Promise<Meal[]>

    findById(id: number, userId: string): Promise<Meal | null>

    storeMeal(data: IMeal.DTOs.Store, userId: string): Promise<Meal>

    update(meal: Meal, data: IMeal.DTOs.Update): Promise<Meal>

    delete(meal: Meal): Promise<void>

    deleteMealsByTypeAndDate(userId: string, date: string | DateTime, mealType: string): Promise<void>;

    deleteMealItemById(id: number, userId: string): Promise<{ userId: string, dateAdded: DateTime }>;
  }

  export interface Helpers { }

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
