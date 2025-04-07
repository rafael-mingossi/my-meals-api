import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserFavorites extends BaseSchema {
  protected tableName = 'user_favorites'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Foreign key to user/profile
      table.uuid('user_id').references('id').inTable('profiles').onDelete('CASCADE').notNullable()

      // References - either food or recipe (but not both)
      table.integer('food_id').unsigned().references('id').inTable('foods').onDelete('CASCADE').nullable()
      table.integer('recipe_id').unsigned().references('id').inTable('recipes').onDelete('CASCADE').nullable()

      // Add a constraint to ensure either food_id or recipe_id is not null, but not both
      table.check('(?? IS NOT NULL AND ?? IS NULL) OR (?? IS NULL AND ?? IS NOT NULL)',
        ['food_id', 'recipe_id', 'food_id', 'recipe_id'])

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    // Add a unique constraint to prevent duplicate favorites
    this.schema.raw(`
      CREATE UNIQUE INDEX user_favorites_unique_food
      ON ${this.tableName} (user_id, food_id)
      WHERE food_id IS NOT NULL
    `)

    this.schema.raw(`
      CREATE UNIQUE INDEX user_favorites_unique_recipe
      ON ${this.tableName} (user_id, recipe_id)
      WHERE recipe_id IS NOT NULL
    `)
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
