// import Boom from 'boom';
import { eq } from 'drizzle-orm';
import UsersTable, { UserModel } from '../database/UsersTable';

class Users {
  public constructor(private usersTable: UsersTable) {}

  public getAll = () => this.usersTable.select().all();

  public create = (user: UserModel) => this.usersTable.insert(user).findOne();

  public getById = (id: string | number) => this.usersTable
    .select().where(eq(this.usersTable.id, Number(id))).findOne();

  public getByEmail = (email: string) => {
    try {
      return this.usersTable
        .select().where(eq(this.usersTable.email, email)).findOne();
    } catch (err: unknown) {
      return undefined;
    }
  };
}

export default Users;
