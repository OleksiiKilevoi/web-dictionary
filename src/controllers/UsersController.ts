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

class UsersController extends Controller {
  public constructor(
    users: Users,
    private projects: Projects,
    private userToProject: UserToProject,
  ) {
    super('/users', users);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get('/:id', wrapped(this.getDictionary));
    this.router.post('/', this.validate(createUserSchema), wrapped(this.createUser));
    this.router.post('/project', this.validate(partialProject), this.protectRoute, this.protectCustomerRoute, wrapped(this.createProject));
    this.router.post('/project/add-user/:id', this.protectRoute, this.protectCustomerRoute, this.addUserToProject);
    this.router.post('/login', wrapped(this.login));
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
    res.status(200).sendFile('storage/myjsonfile.ts');
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
    const newProject = await this.projects.create(req.body);

    return res.status(200).json(okResponse(newProject));
  };
}

export default UsersController;
