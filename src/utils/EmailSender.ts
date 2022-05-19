import nodemailer from 'nodemailer';

import BotLogger from '../loggers/BotLogger';

class EmailSender {
  public constructor(
    protected readonly botLogger: BotLogger,
  ) {}

  public sendOtpEmail = async (email: string, link: string) => {
    const transporter = this.createTransporter();

    const mailOptions = {
      from: 'lunaxodd@gmail.com',
      to: email,
      subject: 'Otp link',
      html: this.getOtpEmailText(email, link),
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  };

  private getOtpEmailText = (email: string, link: string): string => {
    const text = `<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
  
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>HTML Template</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        width: 100% !important;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        margin: 0;
        padding: 0;
        line-height: 100%;
      }
  
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap');
  
      img {
        outline: none;
        text-decoration: none;
        border: none;
        -ms-interpolation-mode: bicubic;
        max-width: 100% !important;
        margin: 0;
        padding: 0;
        display: block;
      }
  
      table td {
        border-collapse: collapse;
      }
  
      table {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
  
      /* @media screen and (-webkit-min-device-pixel-ratio:0) { */
    </style>
  </head>
  
  <body style="margin: 0; padding: 0;">
    <div style="font-size:0px;font-color:#ffffff;opacity:0;visibility:hidden;width:0;height:0;display:none;">Тестовое
      письмо</div>
    <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#f2f5f8" height="100vh">
      <tr>
        <td height="572px" width="576px" height="352px">
          <table cellpadding="0" cellspacing="0" width="640" align="center" bgcolor="#ffffff">
            <tr style="display: inline-block;">
              <td
                style="display: inline-block; padding-top: 32px; padding-left: 32px; padding-bottom: 32px; padding-right: 32px; font-family: Inter,sans-serif; font-weight: 500; font-size: 16px;">
                <p style="font-family: Inter,sans-serif; font-weight: 500; font-size: 16px;">Hi ${email}</p>
              </td>
              <td
                style="display: inline-block; padding-left: 32px;  padding-right: 32px;  font-family: Inter,sans-serif; font-weight: 500; font-size: 16px">
  
                <p style="font-family: Inter,sans-serif; font-weight: 500; font-size: 16px;">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Explicabo, facere!</p>
              </td>
              <td
                style="display: inline-block; padding-left: 32px;  padding-right: 32px;  font-family: Inter,sans-serif; font-weight: 500; font-size: 16px">
                <p style="font-family: Inter,sans-serif; font-weight: 500; font-size: 16px;">Please use the below link to access your portal:</p>
              </td>
              <td
                style=" padding-left: 32px;  padding-right: 32px;  font-family: Inter,sans-serif; font-weight: 500; font-size: 16px">
                <p style="font-family: Inter,sans-serif; font-weight: 500; font-size: 16px;">${link}</p>
              </td>
  
              <td
                style="display: inline-block; padding-top: 32px; padding-left: 32px; padding-bottom: 32px; padding-right: 32px;  font-family: Inter,sans-serif; font-weight: 500; font-size: 16px">
                <p style="font-family: Inter,sans-serif; font-weight: 500; font-size: 16px; line-height: 1.5;">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad, dignissimos ex tenetur dicta vel aliquid molestias. Possimus quam quidem adipisci?</p>
              </td>
  
              <td
                style="display: inline-block; padding-left: 32px; padding-bottom: 32px; padding-right: 32px;  font-family: Inter,sans-serif; font-weight: 500; font-size: 16px">
                <p style="font-family: Inter,sans-serif; font-weight: 500; font-size: 16px; line-height: 1.5;"></p>
              </td>
              <table cellpadding="0" cellspacing="0" width="640px" align="center" bgcolor="#f7f9fc">
                <td
                  style=" height: 128px; padding-left: 32px; padding-right: 32px; padding-bottom: 32px; font-family: Inter,sans-serif; font-weight: 500; font-size: 16px">
                  <p style="font-family: Inter,sans-serif; font-weight: 500; font-size: 16px; line-height: 1.5;">This email was sent to <a href="#">@EMAIL@</a> If you’d rather not
                  receive this kind of email, you can <a href="#">unsubscribe or manage your email
                    preferences. </a></p>
              </table>
        </td>
      </tr>
    </table>
    </td>
    </tr>
  
    </table>
  </body>
  
  </html>
  `;
    return text;
  };

  private createTransporter = () => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: 'nahryshko_roman@kneu.edu.ua',
        pass: 'nagrishkoo@gmail.com',
      },
    });
    return transporter;
  };
}

export default EmailSender;
