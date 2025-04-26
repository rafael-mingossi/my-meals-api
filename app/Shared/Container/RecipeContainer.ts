import { container, delay } from 'tsyringe'

import { IRecipe } from 'App/Interfaces/IRecipe'
import RecipesRepository from 'App/Repositories/RecipesRepository'

container.registerSingleton<IRecipe.Repository>(
  'RecipesRepository',
  delay(() => RecipesRepository)
)
