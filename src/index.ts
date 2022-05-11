import 'dotenv/config';
import 'express-async-errors';

import App from '@/App';
import { DbConnector, drizzle } from 'drizzle-orm';

import CsvController from './controllers/CsvController';
import UsersController from './controllers/UsersController';
import UsersTable from './database/UsersTable';
import Users from './repositories/Users';
import Projects from './repositories/Projects';
import ProjectTable from './database/ProjectTable';
import UserToProjectTable from './database/UserToProjectTable';
import UserToProject from './repositories/UserToProject';

const main = async () => {
  const db = await new DbConnector().connectionString(process.env.DB).connect();

  await drizzle.migrator(db).migrate({ migrationFolder: './drizzle' });

  const usersTable = new UsersTable(db);
  const projectsTable = new ProjectTable(db);
  const userToProjectTable = new UserToProjectTable(db);

  const users = new Users(usersTable);
  const projects = new Projects(projectsTable);
  const userToProject = new UserToProject(userToProjectTable);

  const csvController = new CsvController(users);
  const projectsController = new UsersController(users, projects, userToProject);

  const controllers = [
    csvController,
    projectsController,
  ];

  const port = 5000;
  const app = new App(controllers, port);
  app.listen();

  return app;
};

main();

export default main;
