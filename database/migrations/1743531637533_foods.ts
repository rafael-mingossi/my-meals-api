import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Foods extends BaseSchema {
  protected tableName = 'foods'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Foreign keys
      table.uuid('user_id').references('id').inTable('profiles').onDelete('CASCADE').notNullable()
      table.integer('category_id').unsigned().references('id').inTable('food_categories').onDelete('RESTRICT').notNullable()

      // Food details
      table.string('label').notNullable()
      table.float('protein').notNullable()
      table.float('carbs').notNullable()
      table.float('fat').notNullable()
      table.float('calories').notNullable()
      table.float('fibre').nullable()
      table.float('sodium').nullable()
      table.float('serv_size').notNullable()
      table.string('serv_unit').notNullable()
      table.string('food_img').nullable()
      table.boolean('is_archived').notNullable().defaultTo(false)

      // Add timestamps
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
