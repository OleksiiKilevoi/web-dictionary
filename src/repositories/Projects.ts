import { eq } from 'drizzle-orm';
import ProjectTable, { ProjectModel } from '../database/ProjectTable';

class Projects {
  public constructor(private projectsTable: ProjectTable) {}

  public getAll = () => this.projectsTable.select().all();

  public create = (project: ProjectModel) => this.projectsTable.insert(project).all();

  public getById = (id: string | number) => {
    try {
      return this.projectsTable
        .select()
        .where(eq(this.projectsTable.id, Number(id)))
        .findOne();
    } catch (e) {
      return undefined;
    }
  };

  public updateById = (id: string | number, path: string) => {
    this.projectsTable.update()
      .where(eq(this.projectsTable.id, Number(id)))
      .set({ pathToDictionary: path })
      .findOne();
  };
}

export default Projects;
