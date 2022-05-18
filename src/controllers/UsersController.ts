import { RequestHandler } from 'express';

import Controller from '@/controllers/Controller';

import Users from '@/repositories/Users';
import Projects from '@/repositories/Projects';
import { errorResponse, okResponse } from '@/api/baseResponses';
import { ExtractModel } from 'drizzle-orm';
import UsersTable, { createUserSchema } from '@/database/UsersTable';
import wrapped from '@/utils/Wrapped';
import UserToProject from '@/repositories/UserToProject';

import BotLogger from '@/loggers/BotLogger';

class UsersController extends Controller {
  public constructor(
    users: Users,
    private projects: Projects,
    private userToProject: UserToProject,
    protected readonly botLogger: BotLogger,
    private UPLOADS_PATH = process.env.UPLOADS_PATH,
  ) {
    super('/users', users);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get('/', this.protectRoute, wrapped(this.getMe));
    this.router.get('/info', this.protectRoute, this.getInfoById);
    this.router.get('/:id', this.protectRoute, wrapped(this.getUserById));
    this.router.post('/', this.validate(createUserSchema), wrapped(this.createUser));
  };

  private getUserById: RequestHandler = async (req, res) => {
    const { id } = req.params;

    const user = await this.users.getById(id);

    if (!user) return res.status(400).json(errorResponse('400', 'User with such id was not found'));

    return res.status(200).json(okResponse(user));
  };

  private getInfoById: RequestHandler = async (req, res) => {
    const { user } = req;

    const userToProject = await this.userToProject.getAllByUserId(user!.id!);
    const projects = await Promise.all(userToProject.map(async (bond) => {
      const organization = await this.projects.getById(bond.projectId);
      return organization;
    }));

    return res.status(200).json(okResponse(projects));
  };

  private getMe: RequestHandler = async (req, res) => {
    const { user } = req;

    return res.status(200).json(okResponse(user));
  };

  private createUser: RequestHandler<
  {},
  {},
  { name: string, email: string, password: string, role: ExtractModel<UsersTable>['role']}
  > = async (req, res) => {
    const {
      email, name, password, role,
    } = req.body;

    const newUser = await this.users.create({
      email, name, role, password,
    });

    return res.status(200).json(okResponse(newUser));
  };
}

export default UsersController;
