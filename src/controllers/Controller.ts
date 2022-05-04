import { RequestHandler, Router } from 'express';

import { errorResponse } from '@/api/baseResponses';

import Jwt from '@/utils/Jwt';
import FileLogger from '@/loggers/FileLogger';
import Users from '@/database/repositories/Users';
import { internal } from '@hapi/boom';

abstract class Controller {
  public readonly path: string;
  public readonly router: Router;
  protected readonly jwt: Jwt;

  public constructor(
    path: string,
    protected readonly users: Users,
  ) {
    this.path = path;
    this.router = Router();
    this.jwt = new Jwt();
    this.users = users;
  }

  protected protectRoute: RequestHandler = async (req, res, next) => {
    try {
      if (!req.headers.authorization) throw Error("Can't find authorization header");

      const auth = req.headers.authorization.split(' ');
      if (auth[0] !== 'Bearer' && auth.length !== 2) throw Error('Wrong auth type: should be "Bearer <access_token>"');

      const token = auth[1];
      if (!token) throw Error("Can't find token in authorization header");

      const decoded = this.jwt.verifyAccessToken(token);
      if (!decoded) throw Error('Can\'t find user from token');

      // const user = await this.users.getById(decoded.id);
      // if (!user) throw Error(`Can't find user by id: ${decoded.id} from token`);
      // req.user = user;

      return next();
    } catch (e: unknown) {
      if (e instanceof Error) {
        FileLogger.e(e);
        return res.status(401).json(errorResponse('401', e.message));
      }
      return internal('Internal error');
    }
  };
}

export default Controller;
