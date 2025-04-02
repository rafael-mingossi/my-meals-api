import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

// Import routes
import 'App/Routes/AuthRoutes'
import 'App/Routes/FoodRoutes'
import 'App/Routes/RecipeRoutes'

// import Database from '@ioc:Adonis/Lucid/Database'
// import Route from '@ioc:Adonis/Core/Route'
//
// Route.get('/db-test', async ({ response }) => {
//   try {
//     const result = await Database.query().select(Database.raw('now()'))
//     return response.json({
//       status: 'connected',
//       time: result[0].now,
//       message: 'Successfully connected to Supabase!'
//     })
//   } catch (error) {
//     return response.status(500).json({
//       status: 'error',
//       message: error.message,
//       stack: error.stack
//     })
//   }
// })
