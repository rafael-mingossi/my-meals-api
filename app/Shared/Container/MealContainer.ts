import { container, delay } from 'tsyringe'

import { IMeal } from 'App/Interfaces/IMeal'
import MealsRepository from 'App/Repositories/MealsRepository'

container.registerSingleton<IMeal.Repository>(
  'MealsRepository',
  delay(() => MealsRepository)
)
