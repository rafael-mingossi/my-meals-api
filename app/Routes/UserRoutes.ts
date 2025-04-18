import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.get('/:id', 'UsersController.get')
    Route.put('/edit', 'UsersController.edit')
    Route.delete('/:id', 'UsersController.delete')
    Route.post('/notification-token', 'UsersController.updateNotificationToken')
    Route.delete('/notification-token', 'UsersController.deleteNotificationToken')
  })
    .prefix('/users')
    .middleware('auth:jwt')
})
  .prefix('api')
  .namespace('App/Controllers/Http')
