import UserFavourite from 'App/Models/UserFavourite'

export default class FavouritesRepository {
  /**
   * Get all user favorites
   */
  public async getUserFavourites(userId: string): Promise<UserFavourite[]> {
    return UserFavourite.query()
      .where('user_id', userId)
      .preload('food')
      .preload('recipe')
  }

  /**
   * Add a food to user favorites
   */
  public async addFoodFavourite(userId: string, foodId: number): Promise<UserFavourite> {
    const favorite = new UserFavourite()
    favorite.user_id = userId
    favorite.food_id = foodId
    favorite.recipe_id = null
    await favorite.save()

    await favorite.load('food')
    return favorite
  }

  /**
   * Add a recipe to user favorites
   */
  public async addRecipeFavourite(userId: string, recipeId: number): Promise<UserFavourite> {
    const favorite = new UserFavourite()
    favorite.user_id = userId
    favorite.food_id = null
    favorite.recipe_id = recipeId
    await favorite.save()

    await favorite.load('recipe')
    return favorite
  }

  /**
   * Remove a food from user favorites
   */
  public async removeFoodFavourite(userId: string, foodId: number): Promise<void> {
    await UserFavourite.query()
      .where('user_id', userId)
      .where('food_id', foodId)
      .delete()
  }

  /**
   * Remove a recipe from user favorites
   */
  public async removeRecipeFavourite(userId: string, recipeId: number): Promise<void> {
    await UserFavourite.query()
      .where('user_id', userId)
      .where('recipe_id', recipeId)
      .delete()
  }

  /**
   * Check if a food is in user favorites
   */
  public async isFoodFavourite(userId: string, foodId: number): Promise<boolean> {
    const count = await UserFavourite.query()
      .where('user_id', userId)
      .where('food_id', foodId)
      .count('* as total')

    return Number(count[0].$extras.total) > 0
  }

  /**
   * Check if a recipe is in user favorites
   */
  public async isRecipeFavourite(userId: string, recipeId: number): Promise<boolean> {
    const count = await UserFavourite.query()
      .where('user_id', userId)
      .where('recipe_id', recipeId)
      .count('* as total')

    return Number(count[0].$extras.total) > 0
  }
}
