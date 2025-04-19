import { injectable, inject } from 'tsyringe'
import FoodCategory from 'App/Models/FoodCategory'
import { IFoodCategory } from 'App/Interfaces/IFoodCategory'
import NotFoundException from 'App/Shared/Exceptions/NotFoundException'

@injectable()
export default class FoodCategoryServices {
  constructor(
    @inject('FoodCategoryRepository')
    private foodCategoryRepository: IFoodCategory.Repository
  ) {}

  /**
   * Get all categories
   */
  public async getAllCategories(): Promise<FoodCategory[]> {
    return this.foodCategoryRepository.getAllCategories()
  }

  /**
   * Get category by ID
   */
  public async getCategory(id: number): Promise<FoodCategory> {
    const category = await this.foodCategoryRepository.findById(id)

    if (!category) {
      throw new NotFoundException('Food category not found.')
    }

    return category
  }
}
