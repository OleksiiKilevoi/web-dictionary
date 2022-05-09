import ProjectTable, { ProjectModel } from '../database/ProjectTable';

class Projects {
  public constructor(private projectsTable: ProjectTable) {}

  public getAll = () => this.projectsTable.select().all();

  public create = (project: ProjectModel) => this.projectsTable.insert(project).all();
}

export default Projects;
