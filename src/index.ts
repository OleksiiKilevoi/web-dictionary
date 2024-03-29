import 'dotenv/config';
import 'express-async-errors';

import App from '@/App';
import { DbConnector, drizzle } from 'drizzle-orm';

import LoginController from './controllers/LoginController';
import UsersController from './controllers/UsersController';
import UsersTable from './database/UsersTable';
import Users from './repositories/Users';
import Projects from './repositories/Projects';
import ProjectTable from './database/ProjectTable';
import UserToProjectTable from './database/UserToProjectTable';
import UserToProject from './repositories/UserToProject';
import Otp from './repositories/Otp';
import { OtpsTable } from './database/OtpTable';
import BotLogger from './loggers/BotLogger';
import EmailSender from './utils/EmailSender';
import ProjectController from './controllers/ProjectController';
import Authoriser from './utils/Authoriser';

const main = async () => {
  const db = await new DbConnector().connectionString(process.env.DB || 'postgresql://postgres:password@host.docker.internal:5433/postgres').connect();

  await drizzle.migrator(db).migrate({ migrationFolder: './drizzle' });

  const usersTable = new UsersTable(db);
  const projectsTable = new ProjectTable(db);
  const userToProjectTable = new UserToProjectTable(db);
  const otpTable = new OtpsTable(db);

  const users = new Users(usersTable);
  const projects = new Projects(projectsTable);
  const userToProject = new UserToProject(userToProjectTable);
  const otp = new Otp(otpTable);

  const botLogger = new BotLogger();
  const emailSender = new EmailSender(botLogger);
  const authorizer = new Authoriser(emailSender, otp, botLogger);

  const loginController = new LoginController(users, userToProject, authorizer, otp);
  const projectsController = new ProjectController(users, userToProject,
    projects, userToProject, authorizer);
  const usersController = new UsersController(
    users,
    userToProject,
    projects,
    userToProject,
    botLogger,
  );

  const controllers = [
    loginController,
    usersController,
    projectsController,
  ];

  const port = 5002;
  const app = new App(controllers, port);
  app.listen();

  return app;
};

main();

export default main;
