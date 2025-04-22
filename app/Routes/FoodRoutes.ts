import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  // Food Categories - public routes (no auth required)
  Route.get('/categories', 'FoodCategoryController.index')
  Route.get('/categories/:id', 'FoodCategoryController.show')

  // Food routes - protected (auth required)
  Route.group(() => {
    // Get all foods for the user
    Route.get('/', 'FoodController.index')

    // Get specific food
    Route.get('/:id', 'FoodController.show')

    // Create new food
    Route.post('/', 'FoodController.store')

    // Update food
    Route.put('/:id', 'FoodController.update')

    // Archive food (soft delete)
    Route.put('/:id/archive', 'FoodController.archive')

    // Restore archived food
    Route.put('/:id/restore', 'FoodController.restore')

    // Get list of foods
    Route.post('/byIds', 'FoodController.foodsByIds')
  })
    .prefix('/foods')
    .middleware('auth:jwt')
})
  .prefix('api')
  .namespace('App/Controllers/Http')
