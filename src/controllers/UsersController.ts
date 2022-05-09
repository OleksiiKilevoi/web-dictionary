import { RequestHandler } from 'express';

import Controller from '@/controllers/Controller';

import Users from '@/repositories/Users';
import Projects from '@/repositories/Projects';
import { errorResponse, okResponse } from '@/api/baseResponses';
import { ExtractModel } from 'drizzle-orm';
import UserTable from '@/database/UserTable';
import { ProjectModel } from '@/database/ProjectTable';

class UsersController extends Controller {
  public constructor(
    users: Users,
    private projects: Projects,
  ) {
    super('/users', users);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get('/:id', this.getDictionary);
    this.router.post('/', this.createUser);
    this.router.post('/project', this.protectRoute, this.protectCustomerRoute, this.createProject);
    this.router.post('/login', this.login);
  };

  private login: RequestHandler<
  {},
  {},
  { email: string }> = async (req, res) => {
    try {
      const { email } = req.body;

      const user = await this.users.getByEmail(email);

      if (!user) return res.status(400).json(errorResponse('400', 'Unauthorized'));

      const accessToken = this.jwt.createAccessToken(user.id!);
      const refreshToken = this.jwt.createRefreshToken(user.id!);

      return res.status(200).json(okResponse({ accessToken, refreshToken }));
    } catch (e) {
      if (e instanceof Error) {
        return res.status(404).json(errorResponse('404', e.message));
      }
      return res.status(500).json(errorResponse('500', 'Internal unknown error'));
    }
  };

  private getDictionary: RequestHandler<
  {id: string},
  {}
  > = async (req, res) => {
    // const { id } = req.params;

    // const project = await this.projectsRepository.getById(id);
    // if (!project) return res.status(404).json(errorResponse('404', 'No such project'));
    // const dictionary = Buffer.from(JSON.stringify(project.dictionary));
    // fs.writeFileSync('storage/myjsonfile.json', dictionary, 'utf8');
    // const file = fs.readFileSync('storage/myjsonfile.json');

    // const result = json2ts.convert(file);
    // fs.writeFileSync('storage/myjsonfile.ts', result, 'utf8');
    res.status(200).sendFile('storage/myjsonfile.ts');
  };

  private createUser: RequestHandler<
  {},
  {},
  { name: string, email: string, role: ExtractModel<UserTable>['role']}
  > = async (req, res) => {
    try {
      const { email, name, role } = req.body;

      const newUser = await this.users.create({ email, name, role });

      return res.status(200).json(okResponse(newUser));
    } catch (e) {
      if (e instanceof Error) {
        return res.status(404).json(errorResponse('404', e.message));
      }
      return res.status(500).json(errorResponse('500', 'Internal unknown error'));
    }
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
