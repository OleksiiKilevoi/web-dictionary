import { RequestHandler } from 'express';

import Controller from '@/controllers/Controller';

import Users from '@/repositories/Users';
import Projects from '@/repositories/Projects';
import { errorResponse, okResponse } from '@/api/baseResponses';
import { ExtractModel } from 'drizzle-orm';
import UsersTable, { createUserSchema } from '@/database/UsersTable';
import { ProjectModel, partialProject } from '@/database/ProjectTable';
import wrapped from '@/utils/Wrapped';
import UserToProject from '@/repositories/UserToProject';
import fileUpload from 'express-fileupload';
import * as fs from 'fs';
import convert from '@/utils/MapCsv';

class UsersController extends Controller {
  public constructor(
    users: Users,
    private projects: Projects,
    private userToProject: UserToProject,
    private UPLOADS_PATH = process.env.UPLOADS_PATH,
  ) {
    super('/users', users);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get('/:id', this.protectRoute, wrapped(this.getDictionary));
    this.router.post('/', this.validate(createUserSchema), wrapped(this.createUser));
    this.router.post('/project', this.validate(partialProject), this.protectRoute, this.protectCustomerRoute, wrapped(this.createProject));
    this.router.post('/project/add-user/:id', this.protectRoute, this.protectCustomerRoute, wrapped(this.addUserToProject));
    this.router.post('/login', wrapped(this.login));
    this.router.post('/load-csv/:id', this.protectRoute, wrapped(this.loadCsv));
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

  private addUserToProject: RequestHandler<
  {id: string},
  {},
  {email: string }
  > = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    const user = await this.users.getByEmail(email);

    if (!user) {
      const newUser = await this.users.create({ email, role: 'editor' });
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

  private login: RequestHandler<
  {},
  {},
  { email: string }> = async (req, res) => {
    const { email } = req.body;

    const user = await this.users.getByEmail(email);

    if (!user) return res.status(400).json(errorResponse('400', 'Unauthorized'));

    const accessToken = this.jwt.createAccessToken(user.id!);
    const refreshToken = this.jwt.createRefreshToken(user.id!);

    return res.status(200).json(okResponse({ accessToken, refreshToken }));
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

  private createUser: RequestHandler<
  {},
  {},
  { name: string, email: string, role: ExtractModel<UsersTable>['role']}
  > = async (req, res) => {
    const { email, name, role } = req.body;

    const newUser = await this.users.create({ email, name, role });

    return res.status(200).json(okResponse(newUser));
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
}

export default UsersController;
