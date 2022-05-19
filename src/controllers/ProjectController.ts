import { RequestHandler } from 'express';
import * as fs from 'fs';

import Controller from '@/controllers/Controller';

import { errorResponse, okResponse } from '@/api/baseResponses';

import Users from '@/repositories/Users';
import wrapped from '@/utils/Wrapped';
import { partialProject, ProjectModel } from '@/database/ProjectTable';
import { UserModel } from '@/database/UsersTable';
import Projects from '@/repositories/Projects';
import UserToProject from '@/repositories/UserToProject';
import fileUpload from 'express-fileupload';
import convert from '@/utils/MapCsv';

class ProjectController extends Controller {
  public constructor(
    users: Users,
    private projects: Projects,
    private userToProject: UserToProject,
    private UPLOADS_PATH = process.env.UPLOADS_PATH,
  ) {
    super('/project', users);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get('/:id', this.protectRoute, wrapped(this.getProjectInfo));
    this.router.get('/:id/dictionary', this.protectRoute, wrapped(this.getDictionary));
    this.router.post('/', this.validate(partialProject), this.protectRoute, this.protectCustomerRoute, wrapped(this.createProject));
    this.router.post('/:id/add-user', this.protectRoute, this.protectCustomerRoute, wrapped(this.addUserToProject));
    this.router.delete('/:projectId/remove-user/:id', this.protectRoute, wrapped(this.deleteUserFromProject));
    this.router.post('/:id/load-csv', this.protectRoute, wrapped(this.loadCsv));
  };

  private loadCsv: RequestHandler<{ id: string }> = async (req, res) => {
    const { user } = req;
    const { files } = req.files!;
    const { id } = req.params;

    const project = await this.projects.getById(id);

    if (!project) return res.status(404).json(errorResponse('404', 'Project with such id was not found'));

    const userToProject = await this.userToProject.getByUserAndProjectId(user?.id!, id);
    if (!userToProject) return res.status(404).json(errorResponse('404', 'Unauthorized'));

    const file = files as unknown as fileUpload.UploadedFile;

    if (!fs.existsSync(`${this.UPLOADS_PATH || '/storage'}/${project.id}`)) {
      fs.mkdirSync(`${this.UPLOADS_PATH || '/storage'}/${project.id}`);
    }

    const timestamp = Date.now();
    const destination = `${this.UPLOADS_PATH || '/storage'}/${project.id}/${timestamp}.json`;

    const result = convert(file.data);

    fs.writeFileSync(destination, JSON.stringify(result));
    this.projects.updateById(id, destination);

    return res.status(200).json(okResponse(result));
  };

  private deleteUserFromProject: RequestHandler<
  { id: string, projectId: string }> = async (req, res) => {
    const { id, projectId } = req.params;

    const userToProject = await this.userToProject.deleteUserToProjectRelation(id!, projectId);

    return res.status(200).json(okResponse(userToProject));
  };

  private addUserToProject: RequestHandler<
  {id: string},
  {},
  UserModel
  > = async (req, res) => {
    const { id } = req.params;
    const {
      email,
      role,
      name,
    } = req.body;
    const user = await this.users.getByEmail(email);

    if (!user) {
      const newUser = await this.users.create({
        email, role, name,
      });
      try {
        const userToProject = await this.userToProject
          .create({ userId: newUser.id!, projectId: Number(id) });

        return res.status(200).json(okResponse(userToProject));
      } catch (e) {
        return res.status(400).json(errorResponse('400', 'User already has access'));
      }
    }
    try {
      const userToProject = await this.userToProject
        .create({ userId: user.id!, projectId: Number(id) });

      return res.status(200).json(okResponse(userToProject));
    } catch (e) {
      return res.status(400).json(errorResponse('400', 'User already has access'));
    }
  };

  private createProject: RequestHandler<
  {},
  {},
  ProjectModel
  > = async (req, res) => {
    const { user } = req;
    const newProject = await this.projects.create(req.body);
    await this.userToProject
      .create({ projectId: newProject.id!, userId: user?.id! });

    return res.status(200).json(okResponse(newProject));
  };

  private getProjectInfo: RequestHandler = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    const userToProject = await this.userToProject.getByUserAndProjectId(user!.id!, id);
    if (!userToProject) return res.status(400).json(errorResponse('400', 'You have no project yet'));

    const project = await this.projects.getById(id);
    if (!project) return res.status(400).json(errorResponse('400', 'Project with such id was not found'));

    const usersToProjects = await this.userToProject.getAllByProjectId(project.id!);

    const users = await Promise.all(usersToProjects.map(async (bond) => {
      const organization = await this.users.getById(bond.userId);
      return organization;
    }));

    const response = {
      users,
      project,
    };
    return res.status(200).json(okResponse(response));
  };

  private getDictionary: RequestHandler<
  {id: string},
  {}
  > = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    const userToProject = await this.userToProject.getByUserAndProjectId(user?.id!, id);

    if (!userToProject) return res.status(400).json(errorResponse('400', 'Unauthorized'));

    const project = await this.projects.getById(id);

    if (project && project.pathToDictionary) {
      const dictionary = fs.readFileSync(project?.pathToDictionary).toString();
      return res.status(200).json(okResponse(JSON.parse(dictionary)));
    }
    return res.status(404).json(errorResponse('404', 'Dictionary for this project was not found'));
  };
}

export default ProjectController;
