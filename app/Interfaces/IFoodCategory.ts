import BaseInterface from "App/Shared/Interfaces/BaseInterface";
import FoodCategory from 'App/Models/FoodCategory'

export namespace IFoodCategory {
  export interface Repository extends BaseInterface<typeof FoodCategory>, Helpers {
    getAllCategories(): Promise<FoodCategory[]>
    findById(id: number): Promise<FoodCategory | null>
  }

  export interface Helpers { }

  export namespace DTOs {
    export interface Store {
      name: string
      icon_url: string
      description?: string
      display_order?: number
    }

    export interface Update {
      name?: string
      icon_url?: string
      description?: string
      display_order?: number
    }
  }
}
