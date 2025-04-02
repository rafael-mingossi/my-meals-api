// database/migrations/xxxx_recipes.ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Recipes extends BaseSchema {
  protected tableName = 'recipes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Foreign key to user/profile
      table.uuid('user_id').references('id').inTable('profiles').onDelete('CASCADE').notNullable()

      // Recipe details
      table.string('name').notNullable()
      table.float('t_calories').notNullable()
      table.float('t_carbs').notNullable()
      table.float('t_fat').notNullable()
      table.float('t_protein').notNullable()
      table.float('t_fibre').notNullable()
      table.float('t_sodium').notNullable()
      table.float('serving').nullable()
      table.string('serv_unit').nullable()
      table.string('img').nullable()
      table.boolean('is_archived').notNullable().defaultTo(false)

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
