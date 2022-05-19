import { RequestHandler } from 'express';

import Controller from '@/controllers/Controller';

import { errorResponse, okResponse } from '@/api/baseResponses';

import Users from '@/repositories/Users';
import wrapped from '@/utils/Wrapped';
import { generateProdOtp } from '@/utils/OtpUtils';
import Otp from '@/repositories/Otp';
import EmailSender from '@/utils/EmailSender';

class LoginController extends Controller {
  public constructor(
    users: Users,
    protected readonly emailSender: EmailSender,
    private otps: Otp,
    private UPLOADS_PATH = process.env.UPLOADS_PATH,
  ) {
    super('/login', users);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post('/', wrapped(this.login));
    this.router.post('/refresh', wrapped(this.refreshToken));
  };

  private otp: RequestHandler<
  {},
  {},
  { email: string }
  > = async (req, res) => {
    try {
      const { email } = req.body;
      const otpCode = generateProdOtp();

      const isExist = await this.otps.getByEmail(email);
      if (!isExist) {
        await this.otps.create({
          otp: otpCode,
          email,
          createdAt: Date.now(),
        });
      }

      const otp = await this.otps.update(otpCode, email);

      const encryptedEmail = Buffer.from(email).toString('base64');

      // const message = `login | ${otp.email}\n${process.env.FRONT_URL || 'http://localhost:3000'}/opt/${otpCode}/${encryptedEmail}`;

      const otpLink = `${process.env.FRONT_URL || 'http://localhost:3000'}/opt/${otpCode}/${encryptedEmail}`;

      await this.emailSender.sendOtpEmail(email, otpLink);
      // await this.botLogger.sendMessage(message);

      return res.status(200).json(okResponse(otp));
    } catch (e: unknown) {
      if (e instanceof Error) {
        // this.botLogger.errorReport(e, 'ERROR in LoginController | otp');
        return res.status(400).json(errorResponse('400', e.message));
      }
      return res.status(400).json(errorResponse('400', 'Unknown server error'));
    }
  };

  private login: RequestHandler<
  {},
  {},
  { email: string, password: string }> = async (req, res) => {
    const { email } = req.body;

    const user = await this.users.getByEmail(email);

    if (!user) return res.status(400).json(errorResponse('400', 'Unauthorized'));

    const accessToken = this.jwt.createAccessToken(user.id!);
    const refreshToken = this.jwt.createRefreshToken(user.id!);

    return res.status(200).json(okResponse({ accessToken, refreshToken }));
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
