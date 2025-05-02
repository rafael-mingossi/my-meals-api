import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.delete('/notification-token', 'UsersController.deleteNotificationToken')
    Route.post('/notification-token', 'UsersController.updateNotificationToken')
    Route.put('/edit', 'UsersController.edit')
    Route.get('/:id', 'UsersController.get')
    Route.delete('/:id', 'UsersController.delete')
  })
    .prefix('/users')
    .middleware('auth:jwt')
})
  .prefix('api')
  .namespace('App/Controllers/Http')
