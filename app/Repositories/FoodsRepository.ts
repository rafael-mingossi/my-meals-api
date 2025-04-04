import Food from 'App/Models/Food'
import { IFood } from 'App/Interfaces/IFood'

export default class FoodsRepository {
  /**
   * Store a new food
   */
  public async store(data: IFood.DTOs.Store, userId: string): Promise<Food> {
    const food = new Food()
    food.user_id = userId
    food.label = data.label
    food.category_id = data.category_id
    food.protein = data.protein
    food.carbs = data.carbs
    food.fat = data.fat
    food.calories = data.calories
    food.fibre = data.fibre || null
    food.sodium = data.sodium || null
    food.serv_size = data.serv_size
    food.serv_unit = data.serv_unit
    food.food_img = data.food_img || null
    food.is_archived = false

    await food.save()
    return food
  }

  /**
   * Update an existing food
   */
  public async update(food: Food, data: IFood.DTOs.Update): Promise<Food> {
    food.merge(data)
    await food.save()
    return food
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
