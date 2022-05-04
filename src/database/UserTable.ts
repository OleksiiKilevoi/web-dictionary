/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import AbstractTable from 'drizzle-orm/tables/abstractTable';
import { ExtractModel } from 'drizzle-orm/tables/inferTypes';

export type UserModel = ExtractModel<UserTable>;

export default class UserTable extends AbstractTable<UserTable> {
  public id = this.serial('id').primaryKey();
  public name = this.varchar('name').notNull();
  public email = this.varchar('email').notNull();

  public tableName(): string {
    return 'users';
  }
}
