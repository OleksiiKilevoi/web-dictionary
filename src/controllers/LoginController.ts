import { RequestHandler } from 'express';

import Controller from '@/controllers/Controller';

import { errorResponse, okResponse } from '@/api/baseResponses';

import Users from '@/repositories/Users';
import wrapped from '@/utils/Wrapped';
import Otp from '@/repositories/Otp';
import UserToProject from '@/repositories/UserToProject';
import Authoriser from '@/utils/Authoriser';

class LoginController extends Controller {
  public constructor(
    users: Users,
    usersToProject: UserToProject,
    private authoriser:Authoriser,
    private otps: Otp,
  ) {
    super('/login', users, usersToProject);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post('/', wrapped(this.login));
    this.router.post('/refresh', wrapped(this.refreshToken));
    this.router.post('/validate', wrapped(this.validateOtp));
  };

  private validateOtp: RequestHandler<
  {},
  {},
  { email: string, otp: string }
  > = async (req, res) => {
    try {
      const { email, otp } = req.body;

      const decryptedEmail = Buffer.from(email, 'base64').toString('utf-8');

      const otpDb = await this.otps.getByEmail(decryptedEmail);

      if (!otpDb) return res.status(404).json(errorResponse('400', 'Something went wrong'));

      const user = await this.users.getByEmail(decryptedEmail);

      if (!user) return res.status(400).json(errorResponse('400', 'You haven\'t been added to any company yet'));

      const timeNow = Date.now() - (60 * 60 * 1000);
      const { createdAt } = otpDb;

      if (timeNow > createdAt) return res.status(400).json(errorResponse('400', 'OTP expired'));

      if (otp !== otpDb.otp) return res.status(400).json(errorResponse('400', 'OTP code invalid'));

      const accessToken = this.jwt.createAccessToken(user.id!);
      const refreshToken = this.jwt.createRefreshToken(user.id!);

      return res.status(200).json(okResponse({
        accessToken,
        refreshToken,
      }));
    } catch (e: unknown) {
      if (e instanceof Error) {
        return res.status(400).json(errorResponse('400', e.message));
      }
      return res.status(400).json(errorResponse('400', 'Unknown error'));
    }
  };

  private login: RequestHandler<
  {},
  {},
  { email: string, password: string }> = async (req, res) => {
    const { email } = req.body;

    const user = await this.users.getByEmail(email);

    if (!user) return res.status(400).json(errorResponse('401', 'Unauthorized'));

    await this.authoriser.invite(email);

    return res.status(200).json(okResponse());
  };

  private refreshToken: RequestHandler<
  {},
  {},
  { refreshToken: string }
  > = async (req, res) => {
    try {
      const { refreshToken: oldRefreshToken } = req.body;

      const decoded = this.jwt.verifyRefreshToken(oldRefreshToken);
      const user = await this.users.getById(decoded.id);

      if (!user) return res.status(400).json(errorResponse('400', `Can't find user by id: ${decoded.id} from token`));

      const accessToken = this.jwt.createAccessToken(user.id!);
      const refreshToken = this.jwt.createRefreshToken(user.id!);

      return res.status(200).json(okResponse({
        id: user.id,
        accessToken,
        refreshToken,
      }));
    } catch (e: unknown) {
      if (e instanceof Error) {
        // this.botLogger.errorReport(e, 'ERROR in LoginController | refreshToken');
        return res.status(400).json(errorResponse('400', e.message));
      }
      return res.status(400).json(errorResponse('400', 'unknown error'));
    }
  };
}

export default LoginController;
