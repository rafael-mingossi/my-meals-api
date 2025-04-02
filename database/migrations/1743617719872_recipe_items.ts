import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RecipeItems extends BaseSchema {
  protected tableName = 'recipe_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Foreign keys
      table.integer('recipe_id').unsigned().references('id').inTable('recipes').onDelete('CASCADE').notNullable()
      table.integer('food_id').unsigned().references('id').inTable('foods').onDelete('RESTRICT').notNullable()

      // Item details
      table.float('quantity').notNullable()

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
