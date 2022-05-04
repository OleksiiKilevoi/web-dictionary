import UsersTable from '../UserTable';

class Users {
  public constructor(private usersTable: UsersTable) {
  }

  public getAll = () => this.usersTable.select().all();
}

export default Users;
