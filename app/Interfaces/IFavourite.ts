export namespace IFavourite {
  export namespace DTOs {
    export interface AddFoodFavourite {
      food_id: number
    }

    export interface AddRecipeFavourite {
      recipe_id: number
    }

    // Union type for adding a favorite (either food or recipe)
    export type AddFavorite = AddFoodFavourite | AddRecipeFavourite

    export interface FavouriteResult {
      id: number
      type: 'food' | 'recipe'
      item: any  // Food or Recipe object
    }
  }
}
