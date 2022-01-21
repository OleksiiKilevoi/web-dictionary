import { RequestHandler } from 'express';
import moment from 'moment-timezone';
import fs from 'fs';
let json2ts = require("json2ts");

import Controller from '@/controllers/Controller';


import { ObjectId } from 'mongodb';
import UsersRepository from '@/database/repositories/UsersRepository';
import ProjectsRepository from '@/database/repositories/ProjectsRepository';
import Project from '@/database/models/Project';
import { badRequest } from '@hapi/boom';
import { errorResponse, okResponse } from '@/api/baseResponses';


class ProjectsController extends Controller {
  public constructor(
    usersRepository: UsersRepository,
    private projectsRepository: ProjectsRepository
  ) {
    super('/projects', usersRepository);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
      this.router.get('/:id', this.getDictionary)
    this.router.post('/', this.createProject);
  };

  private getDictionary: RequestHandler<
  {id: string},
  {}
  > = async (req, res) => {
      const { id } = req.params;

      const project = await this.projectsRepository.getById(id);
      if(!project) return res.status(404).json(errorResponse('404', 'No such project'));
      const dictionary = Buffer.from(JSON.stringify(project.dictionary));
      fs.writeFileSync('storage/myjsonfile.json', dictionary, 'utf8');
      const file = fs.readFileSync('storage/myjsonfile.json');

    const result = json2ts.convert(file);
    fs.writeFileSync('storage/myjsonfile.ts', result, 'utf8');
      res.status(200).sendFile('storage/myjsonfile.ts');
  }

  private createProject: RequestHandler<
  {},
  {},
  { name: string, dictionary: object }
  > = async (req, res) => {
    const { body } = req;
    const { name, dictionary } = body;
    const project = new Project(
        name,
        +moment.tz('Europe/Kiev'),
        +moment.tz('Europe/Kiev'),
        dictionary
    )
    const response = await this.projectsRepository.create(project);
   res.status(200).json(response);
  };

  
}

export default ProjectsController;
