import BaseInterface from "App/Shared/Interfaces/BaseInterface";
import Food from 'App/Models/Food'

export namespace IFood {
  export interface Repository extends BaseInterface<typeof Food>, Helpers {
    getUserFoods(userId: string, options?: {
      includeArchived?: boolean,
      categoryId?: number
    }): Promise<Food[]>

    findById(id: number, userId: string): Promise<Food | null>

    updateArchiveStatus(food: Food, isArchived: boolean): Promise<Food>
  }

  export interface Helpers { }

  export namespace DTOs {
    export interface Store {
      label: string
      category_id: number
      protein: number
      carbs: number
      fat: number
      calories: number
      fibre?: number
      sodium?: number
      serv_size: number
      serv_unit: string
      food_img?: string
    }

    export interface Update {
      label?: string
      category_id?: number
      protein?: number
      carbs?: number
      fat?: number
      calories?: number
      fibre?: number
      sodium?: number
      serv_size?: number
      serv_unit?: string
      food_img?: string
    }
  }
}
