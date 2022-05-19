import { eq } from 'drizzle-orm';
import ProjectTable, { ProjectModel } from '../database/ProjectTable';

class Projects {
  public constructor(private projectsTable: ProjectTable) {}

  public getAll = () => this.projectsTable.select().all();

  public create = (project: ProjectModel) => this.projectsTable.insert(project).findOne();

  public getById = async (id: string | number) => {
    try {
      const result = await this.projectsTable
        .select()
        .where(eq(this.projectsTable.id, Number(id)))
        .findOne();
      return result;
    } catch (e) {
      return undefined;
    }
  };

  public updateById = (id: string | number, pathToDictionary: string, pathToCsv: string) => {
    this.projectsTable.update()
      .where(eq(this.projectsTable.id, Number(id)))
      .set({ pathToDictionary, pathToCsv })
      .findOne();
  };
}

export default Projects;
