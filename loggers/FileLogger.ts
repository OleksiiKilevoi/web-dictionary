import fs from 'fs';

class FileLogger {
  private static errors = 'errors.log';
  private static storage = process.env.STORAGE;
  private static info = 'info.log';

  private static date = async (): Promise<string> => new Date().toLocaleString();

  public static i = async (message: string) => {
    try {
      fs.appendFileSync(`${FileLogger.storage}/${FileLogger.info}`,
        `${await FileLogger.date()} : ${message} \n`);
    } catch (e) {
      console.log(e.message);
    }
  };

  public static e = async (error: Error) => {
    try {
      fs.appendFileSync(`${FileLogger.storage}/${FileLogger.errors}`,
        `\n\n>> Time : ${await FileLogger.date()}\n${error.stack!}`);
    } catch (err) {
      console.log(err);
    }
  };

  public static infoLogs = async (): Promise<string> => {
    try {
      const info = fs.readFileSync(`${FileLogger.storage}/${FileLogger.info}`);
      return info.toString();
    } catch (err) {
      console.log(err);
      return '';
    }
  };

  public static errorLogs = async (): Promise<string> => {
    try {
      const errors = fs.readFileSync(`${FileLogger.storage}/${FileLogger.errors}`);
      return errors.toString();
    } catch (err) {
      console.log(err);
      return '';
    }
  };

  public static clear = async () => {
    try {
      fs.writeFileSync(`${FileLogger.storage}/${FileLogger.errors}`, '');
      fs.writeFileSync(`${FileLogger.storage}/${FileLogger.info}`, '');
    } catch (err) {
      console.log(err);
    }
  };
}

export default FileLogger;
