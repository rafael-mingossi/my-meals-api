import BaseRepository from 'App/Shared/Repositories/BaseRepository'
import FoodCategory from 'App/Models/FoodCategory'
import { IFoodCategory } from 'App/Interfaces/IFoodCategory'

export default class FoodCategoryRepository
  extends BaseRepository<typeof FoodCategory>
  implements IFoodCategory.Repository
{
  constructor() {
    super(FoodCategory)
  }

  /**
   * Get all food categories
   */
  public async getAllCategories(): Promise<FoodCategory[]> {
    return FoodCategory.query().orderBy('display_order', 'asc')
  }

  /**
   * Find category by ID
   */
  public async findById(id: number): Promise<FoodCategory | null> {
    return FoodCategory.find(id)
  }
}
