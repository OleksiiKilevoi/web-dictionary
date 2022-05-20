import { RequestHandler } from 'express';
import * as fs from 'fs';

import Controller from '@/controllers/Controller';

import { errorResponse, okResponse } from '@/api/baseResponses';

import Users from '@/repositories/Users';
import wrapped from '@/utils/Wrapped';
import { partialProject, ProjectModel } from '@/database/ProjectTable';
import Projects from '@/repositories/Projects';
import UserToProject from '@/repositories/UserToProject';
import fileUpload from 'express-fileupload';
import convert from '@/utils/MapCsv';
import EmailSender from '@/utils/EmailSender';
import { generateProdOtp } from '@/utils/OtpUtils';
import Otp from '@/repositories/Otp';
import { UserToProjectModel } from '@/database/UserToProjectTable';

class ProjectController extends Controller {
  public constructor(
    users: Users,
    usersToProject: UserToProject,
    private projects: Projects,
    private userToProject: UserToProject,
    private emailSender: EmailSender,
    private otp: Otp,
    private UPLOADS_PATH = process.env.UPLOADS_PATH,
  ) {
    super('/project', users, userToProject);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get('/:id', this.protectRoute, wrapped(this.getProjectInfo));
    this.router.get('/:id/dictionary', this.protectRoute, wrapped(this.getDictionary));
    this.router.post('/', this.validate(partialProject), this.protectRoute, this.protectCustomerRoute, wrapped(this.createProject));
    this.router.post('/:id/add-user', this.protectRoute, this.protectCustomerRoute, wrapped(this.addUserToProject));
    this.router.delete('/:projectId/remove-user/:id', this.protectRoute, wrapped(this.deleteUserFromProject));
    this.router.post('/:id/upload-csv', this.protectRoute, this.protectUpload, wrapped(this.uploadCsv));
    this.router.get('/:id/download-csv', this.protectRoute, this.protectDowdload, wrapped(this.downloadCsv));
    this.router.delete('/:id/delete-csv', this.protectRoute, this.deleteCsv, wrapped(this.deleteCsv));
  };

  private deleteCsv: RequestHandler<
  { id: string }
  > = async (req, res) => {
    const { id } = req.params;

    const project = await this.projects.getById(id);
    if (!project) return res.status(404).json(errorResponse('404', 'Project with such id was not found'));
    const { pathToCsv } = project;

    if (!pathToCsv) return res.status(404).json(errorResponse('404', 'Csv for this project was not found'));
    fs.unlinkSync(pathToCsv);

    await this.projects.deleteCsv(id);

    return res.status(204).json(okResponse());
  };

  private downloadCsv: RequestHandler<
  {id: string},
  {}
  > = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    const userToProject = await this.userToProject.getByUserAndProjectId(user?.id!, id);

    if (!userToProject) return res.status(400).json(errorResponse('400', 'Unauthorized'));

    const project = await this.projects.getById(id);

    if (project && project.pathToCsv) {
      // const dictionary = fs.readFileSync(project?.pathToDictionary).toString();
      return res.status(200).sendFile(project.pathToCsv!, { root: '../' });
    }
    return res.status(404).json(errorResponse('404', 'Dictionary for this project was not found'));
  };

  private uploadCsv: RequestHandler<{ id: string }> = async (req, res) => {
    const { user } = req;
    const { files } = req.files!;
    const { id } = req.params;

    const project = await this.projects.getById(id);

    if (!project) return res.status(404).json(errorResponse('404', 'Project with such id was not found'));

    const userToProject = await this.userToProject.getByUserAndProjectId(user?.id!, id);
    if (!userToProject) return res.status(404).json(errorResponse('404', 'Unauthorized'));

    const file = files as unknown as fileUpload.UploadedFile;

    if (file.mimetype !== 'text/csv') return res.status(404).json(errorResponse('404', 'csv file required'));

    if (!fs.existsSync(`${this.UPLOADS_PATH || '/storage'}/${project.id}`)) {
      fs.mkdirSync(`${this.UPLOADS_PATH || '/storage'}/${project.id}`);
    }

    const fileName = file.name.replace('.csv', '');
    const timestamp = Date.now();
    const pathToJson = `${this.UPLOADS_PATH || '/storage'}/${project.id}/${timestamp}_${fileName}.json`;
    const pathToCsv = `${this.UPLOADS_PATH || '/storage'}/${project.id}/${timestamp}_${file.name}`;
    file.mv(pathToCsv);
    const result = convert(file.data);

    fs.writeFileSync(pathToJson, JSON.stringify(result));

    this.projects.updateById(id, pathToJson, pathToCsv);

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
  {email: string, name: string, deleteCsv: boolean, uploadCsv: boolean, downloadCsv: boolean }
  > = async (req, res) => {
    const { id } = req.params;
    const {
      email, name, deleteCsv, uploadCsv, downloadCsv,
    } = req.body;

    const user = await this.users.getByEmail(email);
    const otpCode = generateProdOtp();
    const encryptedEmail = Buffer.from(email).toString('base64');
    const link = `${process.env.FRONT_URL || 'http://localhost:3000'}/opt/${otpCode}/${encryptedEmail}`;

    const userToProj: UserToProjectModel = {
      userId: user!.id!,
      projectId: Number(id),
      deleteCsv,
      uploadCsv,
      downloadCsv,
    };
    try {
      if (!user) {
        const newUser = await this.users.create({ email, name });
        userToProj.userId = newUser.id!;

        const userToProject = await this.userToProject.create(userToProj);
        this.otp.create({ email: newUser.email, otp: otpCode, createdAt: Date.now() });
        this.emailSender.sendOtpEmail(newUser.email, link);

        return res.status(200).json(okResponse(userToProject));
      }
      const response = await this.userToProject.create(userToProj);
      this.emailSender.sendOtpEmail(user.email, link);
      this.otp.create({ email: user.email, otp: otpCode, createdAt: Date.now() });

      return res.status(200).json(okResponse(response));
    } catch (e: unknown) {
      if (e instanceof Error) {
        return res.status(400).json(errorResponse('400', e.message));
      }
      return res.status(400).json(errorResponse('400', 'Unknown error'));
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
      const userOnProject = await this.users.getById(bond.userId);

      return { ...bond, ...userOnProject };
    }));

    const response = {
      users,
      project,
    };
    return res.status(200).json(okResponse(response));
  };

  private getDictionary: RequestHandler<
  {id: string}
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
    return res.status(200).json(okResponse(undefined));
  };
}

export default ProjectController;
