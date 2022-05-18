/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import AbstractTable from 'drizzle-orm/tables/abstractTable';
import { ExtractModel } from 'drizzle-orm/tables/inferTypes';
import { z } from 'zod';
import { rolesEnum } from './types';

export type UserModel = ExtractModel<UsersTable>;

export default class UsersTable extends AbstractTable<UsersTable> {
  public id = this.serial('id').primaryKey();
  public name = this.varchar('name').notNull();
  public email = this.varchar('email').notNull().unique();
  public password = this.varchar('password').notNull();
  public role = this.type(rolesEnum, 'role');

  public tableName(): string {
    return 'users';
  }
}

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.enum(['customer', 'developer', 'editor']),
});

export const createUserSchema = userSchema.partial({ id: true });
