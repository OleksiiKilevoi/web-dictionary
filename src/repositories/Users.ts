import { eq } from 'drizzle-orm';
import UsersTable, { UserModel } from '../database/UserTable';

class Users {
  public constructor(private usersTable: UsersTable) {
  }

  public getAll = () => this.usersTable.select().all();

  public create = (user: UserModel) => this.usersTable.insert(user).all();

  public getByEmail = (email: string) => this.usersTable
    .select()
    .where(eq(this.usersTable.email, email))
    .findOne();
}

export default Users;
