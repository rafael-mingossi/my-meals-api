export namespace IRecipe {
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
