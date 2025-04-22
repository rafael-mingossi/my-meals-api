import {inject, injectable} from 'tsyringe'
import Food from 'App/Models/Food'
import {IFood} from 'App/Interfaces/IFood'
import NotFoundException from 'App/Shared/Exceptions/NotFoundException'
import BadRequestException from 'App/Shared/Exceptions/BadRequestException'

@injectable()
export default class FoodServices {
  constructor(
    @inject('FoodsRepository')
    private foodsRepository: IFood.Repository
  ) {}

  /**
   * Get all foods for a user
   */
  public async getUserFoods(userId: string, includeArchived: boolean = false, categoryId?: number): Promise<Food[]> {
    return this.foodsRepository.getUserFoods(userId, {
      includeArchived,
      categoryId
    })
  }

  /**
   * Get food by ID
   */
  public async getFood(id: number, userId: string): Promise<Food> {
    const food = await this.foodsRepository.findById(id, userId)

    if (!food) {
      throw new NotFoundException('Food not found or not available.')
    }

    return food
  }

  /**
   * Create new food
   */
  public async store(data: IFood.DTOs.Store, userId: string): Promise<Food> {
    const foodData = {
      user_id: userId,
      ...data,
      is_archived: false
    }

    return await this.foodsRepository.store(foodData)
  }

  /**
   * Update food
   */
  public async update(id: number, userId: string, data: IFood.DTOs.Update): Promise<Food> {
    const food = await this.foodsRepository.findById(id, userId)

    if (!food) {
      throw new NotFoundException('Food not found or not available.')
    }

    food.merge(data)
    await this.foodsRepository.save(food)

    return food.refresh()
  }

  /**
   * Archive/un-archive food
   */
  public async updateArchiveStatus(id: number, userId: string, isArchived: boolean): Promise<Food> {
    const food = await this.foodsRepository.findById(id, userId)

    if (!food) {
      throw new NotFoundException('Food not found or not available.')
    }

    if (food.is_archived === isArchived) {
      throw new BadRequestException(`Food is already ${isArchived ? 'archived' : 'active'}.`)
    }

    return this.foodsRepository.updateArchiveStatus(food, isArchived)
  }

  /**
   * Get list of Foods by IDs
   */
  public async getFoodsByIds(foodIds:number[]): Promise<Food[] | null> {
    const foods = await this.foodsRepository.getFoodsByIds(foodIds)

    return foods
  }
}
