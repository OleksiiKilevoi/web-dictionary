import UserToProjectTable, { UserToProjectModel } from '@/database/UserToProjectTable';
import { and, eq } from 'drizzle-orm';

class UserToProject {
  public constructor(private userToProjectsTable: UserToProjectTable) {}

  //   public getAll = () => this.projectsTable.select().all();

  public create = (userToProject: UserToProjectModel) => this.userToProjectsTable
    .insert(userToProject).all();

  public getByUserAndProjectId = async (
    userId: string | number,
    projectId: string | number,
  ) : Promise<UserToProjectModel | undefined> => {
    try {
      const response = await this.userToProjectsTable
        .select()
        .where(and([
          eq(this.userToProjectsTable.projectId, Number(projectId)),
          eq(this.userToProjectsTable.userId, Number(userId)),
        ]))
        .findOne();
      return response;
    } catch (e) {
      return undefined;
    }
  };
}

export default UserToProject;
