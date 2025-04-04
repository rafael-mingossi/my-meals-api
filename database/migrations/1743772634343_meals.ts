import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Meals extends BaseSchema {
  protected tableName = 'meals'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Foreign key to user/profile
      table.uuid('user_id').references('id').inTable('profiles').onDelete('CASCADE').notNullable()

      // Meal details
      table.string('meal_type').notNullable()
      table.date('date_added').notNullable()

      // Nutritional totals - defaulting to 0
      table.float('t_calories').defaultTo(0)
      table.float('t_carbs').defaultTo(0)
      table.float('t_fat').defaultTo(0)
      table.float('t_protein').defaultTo(0)
      table.float('t_fibre').defaultTo(0)
      table.float('t_sodium').defaultTo(0)

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
