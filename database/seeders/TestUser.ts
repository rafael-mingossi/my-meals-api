// Create this as a standalone script or add to a seeder

import Profile from 'App/Models/Profile'
import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'
import { v4 as uuidv4 } from 'uuid'

async function createTestUser() {
  try {
    // First, check if the user already exists
    const existingUser = await Profile.findBy('email', 'test@example.com')

    if (existingUser) {
      console.log('Test user already exists')
      return
    }

    // Create a test user
    const userId = uuidv4()

    await Profile.create({
      id: userId,
      username: 'testuser',
      email: 'test@example.com',
      full_name: 'Test User',
      gender: 'other',
      height: 175,
      weight: 70,
      cal_goal: 2000,
      protein_goal: 180,
      carbs_goal: 300,
      fat_goal: 60
    })

    // If using ApiToken for authentication, create an entry there too
    const hashedPassword = await Hash.make('password123')

    await Database.table('api_tokens').insert({
      email: 'test@example.com',
      password: hashedPassword,
      user_id: userId,
      created_at: new Date()
    })

    console.log('Test user created successfully')
  } catch (error) {
    console.error('Error creating test user:', error)
  }
}

// Run the function
createTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
