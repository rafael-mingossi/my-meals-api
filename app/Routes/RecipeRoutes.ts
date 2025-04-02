import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  // Recipe routes - protected (auth required)
  Route.group(() => {
    // Get all recipes for the user
    Route.get('/', 'RecipeController.index')

    // Get specific recipe
    Route.get('/:id', 'RecipeController.show')

    // Create new recipe
    Route.post('/', 'RecipeController.store')

    // Update recipe
    Route.put('/:id', 'RecipeController.update')

    // Archive recipe (soft delete)
    Route.put('/:id/archive', 'RecipeController.archive')

    // Restore archived recipe
    Route.put('/:id/restore', 'RecipeController.restore')
  })
    .prefix('/recipes')
    .middleware('auth:jwt')
})
  .prefix('api')
  .namespace('App/Controllers/Http')
