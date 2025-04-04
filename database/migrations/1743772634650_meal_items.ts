import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class MealItems extends BaseSchema {
  protected tableName = 'meal_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Foreign key to meal
      table.integer('meal_id').unsigned().references('id').inTable('meals').onDelete('CASCADE').notNullable()

      // Food reference (optional - either food or recipe should be present)
      table.integer('food_id').unsigned().references('id').inTable('foods').onDelete('RESTRICT').nullable()
      table.float('food_quantity').nullable()

      // Recipe reference (optional - either food or recipe should be present)
      table.integer('recipe_id').unsigned().references('id').inTable('recipes').onDelete('RESTRICT').nullable()
      table.float('recipe_quantity').nullable()

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
