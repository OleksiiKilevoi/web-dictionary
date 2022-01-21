import 'dotenv/config';
import 'express-async-errors';


import App from './App';
import { MongoClient } from 'mongodb';
import UsersRepository from './database/repositories/UsersRepository';
import OtpController from './controllers/OtpController';
import ProdNotificator from './utils/ProdNotificator';
import AuthOtpRepository from './database/repositories/AuthOtpRepository';
import ProjectsController from './controllers/ProjectController';
import ProjectsRepository from './database/repositories/ProjectsRepository';


const main = async (MONGO_URL: string) => {
  const connect = async () => MongoClient.connect(MONGO_URL, {
    useUnifiedTopology: true,
  });
  const client = await connect();

  const usersRepository = new UsersRepository(client);
  const authOtpRepository = new AuthOtpRepository(client);
  const projectsRepository = new ProjectsRepository(client);
  const notificator = new ProdNotificator();

  const otpController = new OtpController(usersRepository, authOtpRepository, notificator);
  const projectsController = new ProjectsController(usersRepository, projectsRepository);

  const controllers = [
    otpController,
    projectsController
  ];

  const port = 5000;
  const app = new App(controllers, port);
  app.listen();

  return app;
};

main(process.env.MONGO_URL);

export default main;
