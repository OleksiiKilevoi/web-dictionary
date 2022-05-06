import 'dotenv/config';
import 'express-async-errors';

import App from '@/App';
import { DbConnector, drizzle } from 'drizzle-orm';

import CsvController from './controllers/CsvController';
import ProjectsController from './controllers/ProjectController';
import UserTable from './database/UserTable';
import Users from './database/repositories/Users';
import Projects from './database/repositories/Projects';
import ProjectTable from './database/ProjectTable';

const main = async () => {
  const db = await new DbConnector().connectionString(process.env.DB).connect();

  await drizzle.migrator(db).migrate({ migrationFolder: './drizzle' });

  const usersTable = new UserTable(db);
  const projectsTable = new ProjectTable(db);

  const users = new Users(usersTable);
  const projects = new Projects(projectsTable);

  const csvController = new CsvController(users);
  const projectsController = new ProjectsController(users, projects);

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
