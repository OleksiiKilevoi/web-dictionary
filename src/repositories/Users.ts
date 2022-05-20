import { eq } from 'drizzle-orm';
import UsersTable, { UserModel } from '../database/UsersTable';

class Users {
  public constructor(private usersTable: UsersTable) {}

  public getAll = () => this.usersTable.select().all();

  public create = (user: UserModel) => this.usersTable.insert(user).findOne();

  public getById = async (id: string | number) => {
    try {
      const response = await this.usersTable
        .select().where(eq(this.usersTable.id, Number(id))).findOne();
      return response;
    } catch (err: unknown) {
      return undefined;
    }
  };

  public getByEmail = async (email: string) => {
    try {
      const response = await this.usersTable
        .select()
        .where(eq(this.usersTable.email, email))
        .findOne();
      return response;
    } catch (err: unknown) {
      return undefined;
    }
  };
}

export default Users;
