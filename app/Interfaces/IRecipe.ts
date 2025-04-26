import BaseInterface from "App/Shared/Interfaces/BaseInterface";
import Recipe from 'App/Models/Recipe'

export namespace IRecipe {
  export interface Repository extends BaseInterface<typeof Recipe>, Helpers {
    getUserRecipes(userId: string, options?: {
      includeArchived?: boolean
    }): Promise<Recipe[]>

    findById(id: number, userId: string): Promise<Recipe | null>

    storeRecipe(data: IRecipe.DTOs.Store, userId: string): Promise<Recipe>

    update(recipe: Recipe, data: IRecipe.DTOs.Update): Promise<Recipe>

    updateArchiveStatus(recipe: Recipe, isArchived: boolean): Promise<Recipe>

    getRecipesByIds(recipeIds: number[]): Promise<Recipe[] | null>
  }

  export interface Helpers { }

  export namespace DTOs {
    export interface RecipeItem {
      id?: number
      food_id: number
      quantity: number
    }

    export interface Store {
      name: string
      serving?: number | null
      serv_unit?: string | null
      img?: string | null
      items: RecipeItem[]
    }

    export interface Update {
      name?: string
      serving?: number | null
      serv_unit?: string | null
      img?: string | null
      items?: RecipeItem[]
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
