export namespace IFood {
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
