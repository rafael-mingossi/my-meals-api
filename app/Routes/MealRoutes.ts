import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    // 1.Static specific routes, with NO params
    // Get nutrition summary for date range
    Route.get('/summary', 'MealController.getNutritionSummary')

    // Delete meals by type and date
    Route.delete('/type-date', 'MealController.destroyByTypeAndDate')

    // 2. Specific routes with named parameters
    // Get meals for a specific date
    Route.get('/date/:date', 'MealController.getByDate')

    // Delete a specific meal item
    Route.delete('/items/:id', 'MealController.destroyMealItem')

    // 3. Generic parameter routes
    // Get specific meal
    Route.get('/:id', 'MealController.show')

    // Update meal
    Route.put('/:id', 'MealController.update')

    // Delete a specific meal
    Route.delete('/:id', 'MealController.destroy')

    // 4. Root routes
    // Get all meals for the user
    Route.get('/', 'MealController.index')

    // Create new meal
    Route.post('/', 'MealController.store')
  })
    .prefix('/meals')
    .middleware('auth:jwt')
})
  .prefix('api')
  .namespace('App/Controllers/Http')
