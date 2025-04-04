import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FoodCategory from 'App/Models/FoodCategory'

export default class FoodCategoryController {
  /**
   * Get all food categories
   */
  public async index({ response }: HttpContextContract) {
    try {
      const categories = await FoodCategory.query().orderBy('display_order', 'asc')

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
      const category = await FoodCategory.find(params.id)

      if (!category) {
        return response.status(404).json({
          message: 'Food category not found'
        })
      }

      return response.json(category)
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to fetch food category',
        error: error.message
      })
    }
  }
}
