/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import AbstractTable from 'drizzle-orm/tables/abstractTable';
import { ExtractModel } from 'drizzle-orm/tables/inferTypes';
import ProjectTable from './ProjectTable';
import UsersTable from './UsersTable';

export type UserToProjectModel = ExtractModel<UserToProjectTable>;

export default class UserToProjectTable extends AbstractTable<UserToProjectTable> {
  public id = this.serial('id').primaryKey();
  public projectId = this.int('project_id').notNull().foreignKey(ProjectTable, (table) => table.id);
  public userId = this.int('user_id').notNull().foreignKey(UsersTable, (table) => table.id);

  public bond = this.uniqueIndex([this.projectId, this.userId]);

  public tableName(): string {
    return 'users_to_project';
  }
}
