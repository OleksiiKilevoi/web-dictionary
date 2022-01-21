import FileLogger from '@/loggers/FileLogger';
import axios from 'axios';
import { Notificator } from './Notificator';

export default class ProdNotificator implements Notificator {
  public sendOtp = (phoneNumber: string, otp: string): any => {
    try {
      axios.post(process.env.OTP_API, {
        from: 'marketing',
        text: otp,
        phoneNumbers: [phoneNumber],
      }, {
        auth: {
          username: process.env.ESPUTNIK_USERNAME!,
          password: process.env.ESPUTNIK_PASSWORD!,
        },
      });
    } catch (e) {
      FileLogger.e(e);
      throw new Error(e.message);
    }
  };
}
