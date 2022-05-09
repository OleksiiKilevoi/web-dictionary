import UsersTable, { UserModel } from '../database/UserTable';

class Users {
  public constructor(private usersTable: UsersTable) {
  }

  public getAll = () => this.usersTable.select().all();

  public create = (user: UserModel) => this.usersTable.insert(user).all();
}

export default Users;
