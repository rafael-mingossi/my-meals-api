import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    // Get all meals for the user
    Route.get('/', 'MealController.index')

    // Get nutrition summary for date range
    Route.get('/summary', 'MealController.getNutritionSummary')

    // Get specific meal
    Route.get('/:id', 'MealController.show')

    // Create new meal
    Route.post('/', 'MealController.store')

    // Update meal
    Route.put('/:id', 'MealController.update')

    // Delete meal
    Route.delete('/:id', 'MealController.destroy')

    // Get meals for a specific date
    Route.get('/date/:date', 'MealController.getByDate')
  })
    .prefix('/meals')
    .middleware('auth:jwt')
})
  .prefix('api')
  .namespace('App/Controllers/Http')
