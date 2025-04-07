import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

import 'App/Routes/AuthRoutes'
import 'App/Routes/FoodRoutes'
import 'App/Routes/RecipeRoutes'
import 'App/Routes/MealRoutes'
import 'App/Routes/FavouriteRoutes'
