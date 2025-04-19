import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FoodCategoryServices from 'App/Services/FoodCategoryServices'
import { container } from 'tsyringe'

export default class FoodCategoryController {
  private categoryServices: FoodCategoryServices

  constructor() {
    this.categoryServices = container.resolve(FoodCategoryServices)
  }

  /**
   * Get all food categories
   */
  public async index({ response }: HttpContextContract) {
    try {
      const categories = await this.categoryServices.getAllCategories()
      return response.json(categories)
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to fetch food categories',
        error: error.message
      })
    }
  }

  /**
   * Get a specific food category by ID
   */
  public async show({ params, response }: HttpContextContract) {
    try {
      const category = await this.categoryServices.getCategory(params.id)
      return response.json(category)
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.status(404).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Failed to fetch food category',
        error: error.message
      })
    }
  }
}
