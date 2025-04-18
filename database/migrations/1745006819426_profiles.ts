import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddSoftDeleteToProfiles extends BaseSchema {
  protected tableName = 'profiles'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.boolean('is_deleted').notNullable().defaultTo(false)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('deleted_at')
      table.dropColumn('is_deleted')
    })
  }
}
