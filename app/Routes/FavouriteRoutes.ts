import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  // Favourites routes - protected (auth required)
  Route.group(() => {
    // Get all favorites for the user
    Route.get('/', 'FavouriteController.index')

    // Add to favorites
    Route.post('/food', 'FavouriteController.addFoodFavourite')
    Route.post('/recipe', 'FavouriteController.addRecipeFavourite')

    // Remove from favorites
    Route.delete('/food/:id', 'FavouriteController.removeFoodFavourite')
    Route.delete('/recipe/:id', 'FavouriteController.removeRecipeFavourite')
  })
    .prefix('/favorites')
    .middleware('auth:jwt')
})
  .prefix('api')
  .namespace('App/Controllers/Http')
