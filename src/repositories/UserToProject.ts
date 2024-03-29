import UserToProjectTable, { UserToProjectModel } from '@/database/UserToProjectTable';
import { and, eq } from 'drizzle-orm';

class UserToProject {
  public constructor(private userToProjectsTable: UserToProjectTable) {}

  public create = (userToProject: UserToProjectModel) => {
    const { deleteCsv, uploadCsv, downloadCsv } = userToProject;
    return this.userToProjectsTable
      .insert(userToProject)
      .onConflict((table) => table.bond, { deleteCsv, uploadCsv, downloadCsv })
      .all();
  };

  public getAllByUserId = async (userId: string | number) => this.userToProjectsTable
    .select()
    .where(eq(this.userToProjectsTable.userId, Number(userId)))
    .all();

  public getAllByProjectId = async (projectId: string | number) => this.userToProjectsTable
    .select()
    .where(eq(this.userToProjectsTable.projectId, Number(projectId)))
    .all();

  public updatePermissions = async (model:UserToProjectModel) => this.userToProjectsTable
    .update()
    .where(and([
      eq(this.userToProjectsTable.projectId, Number(model.projectId)),
      eq(this.userToProjectsTable.userId, Number(model.userId)),
    ]))
    .set(model)
    .findOne();

  public deleteUserToProjectRelation = async (
    userId: string | number,
    projectId: string | number,
  ) : Promise<UserToProjectModel | undefined> => {
    try {
      const response = await this.userToProjectsTable
        .delete()
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
