import { RequestHandler } from 'express';
import moment from 'moment-timezone';

import Controller from '@/controllers/Controller';

import { generateDevOtp, generateProdOtp } from '@/utils/OtpUtils';
import ProdNotificator from '@/utils/ProdNotificator';

import { errorResponse, okResponse } from '@/api/baseResponses';

import Stage from '@/enums/Stage';
import FileLogger from '@/loggers/FileLogger';

import { ObjectId } from 'mongodb';
import UsersRepository from '@/database/repositories/UsersRepository';
import AuthOtpRepository from '@/database/repositories/AuthOtpRepository';

class OtpController extends Controller {
  public constructor(
    usersRepository: UsersRepository,
    private authOtpRepository: AuthOtpRepository,
    private notificator: ProdNotificator,
  ) {
    super('/otp', usersRepository);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post('/', this.sendOtp);
    this.router.post('/validate', this.validateOtp);
  };

  private sendOtp: RequestHandler<
  {},
  {},
  { phone_number: string }
  > = async (req, res) => {
    try {
      const { phone_number: phoneNumber } = req.body;

      const otpUser = await this.authOtpRepository.getByPhoneNumber(phoneNumber);

      let otp = generateDevOtp();
      if (Stage[process.env.STAGE] === Stage.PROD) {
        otp = generateProdOtp();
      }

      if (otpUser) {
        await this.authOtpRepository.updateOtp(phoneNumber, otp);
      } else {
        await this.authOtpRepository.create({
          phone: phoneNumber,
          otp,
          createdAt: +moment.tz('Europe/Kiev'),
          updatedAt: +moment.tz('Europe/Kiev'),
          issuedAt: +moment.tz('Europe/Kiev'),
          _id: new ObjectId(),
        });
      }

      if (Stage[process.env.STAGE] === Stage.PROD) {
        await this.notificator.sendOtp(phoneNumber, otp);
      }

      return res.status(200).json(okResponse());
    } catch (e) {
      FileLogger.e(e);
      return res.status(400).json(errorResponse('400', e.message));
    }
  };

  private validateOtp: RequestHandler<
  {},
  {},
  { phone_number: string; otp: string }
  > = async (req, res) => {
    try {
      const {
        phone_number: phoneNumber,
        otp,
      } = req.body;

      const {
        isAdmin = null,
      } = req.query;

      const authOtp = await this.authOtpRepository.getByPhoneNumber(phoneNumber);
      if (!authOtp) {
        return res.status(404)
          .json(errorResponse('404', `Auth user with number: ${phoneNumber} doesn't exist`));
      }

      const timeNow = +moment.tz('Europe/Kiev').subtract('3', 'minute');
      const { issuedAt } = authOtp;

      if (timeNow > issuedAt) {
        return res.status(400)
          .json(errorResponse('400', 'OTP expired'));
      }

      if (authOtp.otp !== otp) {
        return res.status(400)
          .json(errorResponse('400', 'OTP code is invalid'));
      }

      const user = await this.usersRepository.getByPhoneNumber(phoneNumber);
      if (user) {
        const accessToken = this.jwt.createAccessToken(user._id.toString());
        const refreshToken = this.jwt.createRefreshToken(user._id.toString());

        return res.status(200).json(okResponse({
          access_token: accessToken,
          refresh_token: refreshToken,
        }));
      }

      const newUser = await this.usersRepository.create({
        _id: new ObjectId(),
        phone: phoneNumber,
        createdAt: +moment.tz('Europe/Kiev'),
        updatedAt: +moment.tz('Europe/Kiev'),
      });

      const accessToken = this.jwt.createAccessToken(newUser._id.toString());
      const refreshToken = this.jwt.createRefreshToken(newUser._id.toString());

      FileLogger.i(`new user validated and created: ${newUser.phone}`);
      return res.status(200).json(okResponse({
        access_token: accessToken,
        refresh_token: refreshToken,
      }));
    } catch (e) {
      FileLogger.e(e);
      return res.status(400).json(e.message);
    }
  };
}

export default OtpController;
