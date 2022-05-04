import ProjectTable from '../ProjectTable';

class Projects {
  public constructor(private projectsTable: ProjectTable) {}

  public getAll = () => this.projectsTable.select().all();
}

export default Projects;
