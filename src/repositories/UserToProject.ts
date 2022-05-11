import UserToProjectTable, { UserToProjectModel } from '@/database/UserToProjectTable';

class UserToProject {
  public constructor(private projectsTable: UserToProjectTable) {}

  //   public getAll = () => this.projectsTable.select().all();

  public create = (userToProject: UserToProjectModel) => this.projectsTable
    .insert(userToProject).all();
}

export default UserToProject;
