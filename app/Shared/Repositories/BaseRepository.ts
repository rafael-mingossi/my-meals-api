import { LucidModel } from '@ioc:Adonis/Lucid/Orm'

import IBaseRepository, {
  ContextParams,
  ModelType,
} from 'App/Shared/Interfaces/BaseInterface'

export default class BaseRepository<Model extends LucidModel> implements IBaseRepository<Model> {
  constructor(protected orm: Model) {}

  /**
   * Repository
   */

  public async store(values: ModelType<Model>): Promise<InstanceType<Model>> {
    return this.orm.create(values)
  }

  public async storeMany(values: Array<ModelType<Model>>): Promise<Array<InstanceType<Model>>> {
    return this.orm.createMany(values)
  }

  public async save<T extends InstanceType<Model>>(model: T): Promise<T> {
    return model.save()
  }

  /**
   * Helpers
   */

  public async findBy(
    key: string,
    value: any,
    params?: ContextParams<Model>
  ): Promise<InstanceType<Model> | null> {
    const model = this.orm.query().where(key, value)

    if (params) {
      const { clauses, orders, scopes } = params

      if (clauses)
        Object.entries(clauses).find(([key, value]: [string, any]) => {
          if (key === 'where') if (value) model.where(value)

          if (key === 'like') {
            const { column, match } = value
            if (column && match) model.where(column, 'LIKE', `%${match}%`)
          }
        })

      if (scopes) model.withScopes(scopes)

      if (orders)
        for (const { column, direction } of orders)
          if (column) model.orderBy(String(column), direction ? direction : 'asc')
    }

    return model.first()
  }
}
