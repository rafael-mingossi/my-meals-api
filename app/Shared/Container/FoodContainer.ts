import { container, delay } from 'tsyringe'

import { IFood } from 'App/Interfaces/IFood'
import { IFoodCategory } from 'App/Interfaces/IFoodCategory'
import FoodsRepository from 'App/Repositories/FoodsRepository'
import FoodCategoryRepository from 'App/Repositories/FoodCategoryRepository'

container.registerSingleton<IFood.Repository>(
  'FoodsRepository',
  delay(() => FoodsRepository)
)

container.registerSingleton<IFoodCategory.Repository>(
  'FoodCategoryRepository',
  delay(() => FoodCategoryRepository)
)
