import BotLogger from '@/loggers/BotLogger';
import Otp from '@/repositories/Otp';
import EmailSender from './EmailSender';
import { generateProdOtp } from './OtpUtils';

export default class Authoriser {
  public constructor(
    private emailSender: EmailSender,
    private otp: Otp,
    protected readonly botLogger: BotLogger,
  ) {}

  public invite = async (email: string) => {
    try {
      const otpCode = generateProdOtp();
      await this.otp.create({ email, otp: otpCode, createdAt: Date.now() });

      const encryptedEmail = Buffer.from(email).toString('base64');
      const link = `${process.env.FRONT_URL || 'http://localhost:3000'}/opt/${otpCode}/${encryptedEmail}`;

      await this.emailSender.sendOtpEmail(email, link);
    } catch (e: unknown) {
      if (e instanceof Error) BotLogger.log(e.message);
      throw Error('unknown error in Authorizer');
    }
  };
}
