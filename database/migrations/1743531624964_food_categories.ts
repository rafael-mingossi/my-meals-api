import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FoodCategories extends BaseSchema {
  protected tableName = 'food_categories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Add food category fields
      table.string('name').notNullable()
      table.string('icon_url').notNullable()
      table.text('description').nullable()
      table.integer('display_order').nullable()

      // Add timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
