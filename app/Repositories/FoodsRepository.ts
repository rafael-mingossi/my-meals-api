import BaseRepository from 'App/Shared/Repositories/BaseRepository'
import Food from 'App/Models/Food'
import { IFood } from 'App/Interfaces/IFood'

export default class FoodsRepository
  extends BaseRepository<typeof Food>
  implements IFood.Repository
{
  constructor() {
    super(Food)
  }

  /**
   * Get user's foods with optional filtering
   */
  public async getUserFoods(userId: string, options: {
    includeArchived?: boolean,
    categoryId?: number
  } = {}): Promise<Food[]> {
    const query = Food.query()
      .where('user_id', userId)

    if (!options.includeArchived) {
      query.where('is_archived', false)
    }

    if (options.categoryId) {
      query.where('category_id', options.categoryId)
    }

    return query.orderBy('label', 'asc')
  }

  /**
   * Find food by ID for a specific user
   */
  public async findById(id: number, userId: string): Promise<Food | null> {
    return Food.query()
      .where('id', id)
      .where('user_id', userId)
      .first()
  }

  /**
   * Update food archive status
   */
  public async updateArchiveStatus(food: Food, isArchived: boolean): Promise<Food> {
    food.is_archived = isArchived
    await food.save()
    return food
  }
}
