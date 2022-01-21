import express, {
  Application,
  NextFunction,
  Request,
  Response,
} from 'express';
import { isBoom } from '@hapi/boom';
import cors from 'cors';

import Controller from './controllers/Controller';

class App {
  public app: Application;
  private readonly port: number;
  private readonly controllers: Controller[];

  public constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;
    this.controllers = controllers;

    this.initializeMiddlewares();
    this.initializeControllers();
    this.initializeErrorHandler();
  }

  public listen = () => {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  };

  private initializeMiddlewares = () => {
    this.app.use(express.json());
    this.app.use(
      cors({
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
      }),
    );
  };

  private initializeControllers = () => {
    this.controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router);
    });
  };

  private initializeErrorHandler = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.app.use((e: Error, _: Request, res: Response, _2: NextFunction) => {
      if (e) {
        const status = isBoom(e) ? e.output.statusCode : 500;
        const message = isBoom(e) ? e.message : (e?.message || 'Something went wrong');
        res.status(status).send(message);
      }
    });
  };
}

export default App;
