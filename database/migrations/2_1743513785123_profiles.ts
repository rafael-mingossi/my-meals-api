import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('uuid_generate_v4()').knexQuery)
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table.string('username').nullable()
      table.string('full_name').nullable()
      table.string('avatar_url').nullable()
      table.string('gender').nullable()
      table.float('height').nullable()
      table.float('weight').nullable()
      table.integer('cal_goal').defaultTo(2000)
      table.integer('protein_goal').defaultTo(180)
      table.integer('carbs_goal').defaultTo(300)
      table.integer('fat_goal').defaultTo(60)
      table.string('temp_token').nullable()
      table.string('temp_password').nullable()
      table.timestamp('temp_token_create_at').nullable()
      table.string('notification_token').nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
