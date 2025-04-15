import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  // Public routes (no auth required)
  Route.post('/login', 'AuthController.login')
  Route.post('/debug-login', 'AuthController.debugLogin')
  // Route.post('/test-jwt', 'AuthController.testJwt')
  Route.post('/register', 'AuthController.register')
  Route.post('/forgot-password', 'AuthController.forgotPassword')
  Route.get('/reset-password/:tempToken/:email', 'AuthController.resetPassword')
  Route.get('/check-username', 'AuthController.isUsernameAvailable')
  Route.get('/check-email', 'AuthController.isEmailAvailable')
  Route.post('/refresh-token', 'AuthController.refreshToken')

  // Protected routes (auth required)
  Route.group(() => {
    Route.post('/logout', 'AuthController.logout')
    Route.post('/edit-password', 'AuthController.editPassword')
  }).middleware('auth:jwt')
})
  .prefix('api/auth')
  .namespace('App/Controllers/Http')
