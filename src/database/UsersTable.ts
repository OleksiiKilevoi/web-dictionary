/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import AbstractTable from 'drizzle-orm/tables/abstractTable';
import { ExtractModel } from 'drizzle-orm/tables/inferTypes';
import { z } from 'zod';

export type UserModel = ExtractModel<UsersTable>;

export default class UsersTable extends AbstractTable<UsersTable> {
  public id = this.serial('id').primaryKey();
  public name = this.varchar('name').notNull();
  public email = this.varchar('email').notNull().unique();
  public deleteCsv = this.bool('deleteCsv').notNull().defaultValue(false);
  public uploadCsv = this.bool('uploadCsv').notNull().defaultValue(false);
  public downloadCsv = this.bool('downloadCsv').notNull().defaultValue(false);

  public tableName(): string {
    return 'users';
  }
}

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  deleteCsv: z.boolean(),
  uploadCsv: z.boolean(),
  downloadCsv: z.boolean(),
});

export const createUserSchema = userSchema.partial({
  id: true, uploadCsv: true, downloadCsv: true, deleteCsv: true,
});
