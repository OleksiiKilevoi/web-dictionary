/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import AbstractTable from 'drizzle-orm/tables/abstractTable';
import { ExtractModel } from 'drizzle-orm/tables/inferTypes';

export type ProjectModel = ExtractModel<ProjectTable>;

export default class ProjectTable extends AbstractTable<ProjectTable> {
  public id = this.serial('id').primaryKey();
  public name = this.varchar('name').notNull();

  public tableName(): string {
    return 'projects';
  }
}
