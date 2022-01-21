import { RequestHandler, Router } from 'express';



import { errorResponse } from '@/api/baseResponses';

import Jwt from '@/utils/Jwt';
import FileLogger from '@/loggers/FileLogger';
import UsersRepository from '@/database/repositories/UsersRepository';

abstract class Controller {
  public readonly path: string;
  public readonly router: Router;
  protected readonly jwt: Jwt;
  protected readonly usersRepository: UsersRepository;

  public constructor(
    path: string,
    usersRepository: UsersRepository,
  ) {
    this.path = path;
    this.router = Router();
    this.jwt = new Jwt();
    this.usersRepository = usersRepository;
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

      const user = await this.usersRepository.getById(decoded.id);
      if (!user) throw Error(`Can't find user by id: ${decoded.id} from token`);
      req.user = user;

      return next();
    } catch (e) {
      FileLogger.e(e);
      return res.status(401).json(errorResponse('401', e.message));
    }
  };
}

export default Controller;
