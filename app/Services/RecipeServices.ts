import {inject, injectable} from 'tsyringe'
import Recipe from 'App/Models/Recipe'
import {IRecipe} from 'App/Interfaces/IRecipe'
import NotFoundException from 'App/Shared/Exceptions/NotFoundException'
import BadRequestException from 'App/Shared/Exceptions/BadRequestException'

@injectable()
export default class RecipeServices {
  constructor(
    @inject('RecipesRepository')
    private recipesRepository: IRecipe.Repository
  ) {}

  /**
   * Get all recipes for a user
   */
  public async getUserRecipes(userId: string, includeArchived: boolean = false): Promise<Recipe[]> {
    return this.recipesRepository.getUserRecipes(userId, {
      includeArchived
    })
  }

  /**
   * Get recipe by ID
   */
  public async getRecipe(id: number, userId: string): Promise<Recipe> {
    const recipe = await this.recipesRepository.findById(id, userId)

    if (!recipe) {
      throw new NotFoundException('Recipe not found or not available.')
    }

    return recipe
  }

  /**
   * Create new recipe
   */
  public async store(data: IRecipe.DTOs.Store, userId: string): Promise<Recipe> {
    return this.recipesRepository.storeRecipe(data, userId)
  }

  /**
   * Update recipe
   */
  public async update(id: number, userId: string, data: IRecipe.DTOs.Update): Promise<Recipe> {
    const recipe = await this.recipesRepository.findById(id, userId)

    if (!recipe) {
      throw new NotFoundException('Recipe not found or not available.')
    }

    return this.recipesRepository.update(recipe, data)
  }

  /**
   * Archive/un-archive recipe
   */
  public async updateArchiveStatus(id: number, userId: string, isArchived: boolean): Promise<Recipe> {
    const recipe = await this.recipesRepository.findById(id, userId)

    if (!recipe) {
      throw new NotFoundException('Recipe not found or not available.')
    }

    if (recipe.is_archived === isArchived) {
      throw new BadRequestException(`Recipe is already ${isArchived ? 'archived' : 'active'}.`)
    }

    return this.recipesRepository.updateArchiveStatus(recipe, isArchived)
  }

  /**
   * Get a list of Recipes in a Meal
   * @param recipeIds - array of Ids
   */
  public async getRecipesByIds(recipeIds: number[]): Promise<Recipe[] | null>{
    const recipes = await this.recipesRepository.getRecipesByIds(recipeIds);

    return recipes;
  }
}
