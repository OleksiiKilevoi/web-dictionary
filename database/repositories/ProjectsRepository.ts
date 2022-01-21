import { Collection, MongoClient, ObjectId } from 'mongodb';
import Project from '../models/Project';

class ProjectsRepository {
  private projects: Collection<Project>;

  public constructor(mongoClient: MongoClient) {
    this.projects = mongoClient.db().collection('projects');
  }

  public getAll = () => this.projects.find().toArray();


  public getById = (projectId: string) => (
    this.projects.findOne(
      { _id: new ObjectId(projectId)},
    ));

  public create = (project: Project) => this.projects.insertOne(project).then((item) => item.ops[0]);

  public update = (id: string, update: Partial<Project>) => (
    this.projects.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
    ));
}

export default ProjectsRepository;
