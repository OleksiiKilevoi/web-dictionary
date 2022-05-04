import { RequestHandler } from 'express';
import * as fs from 'fs';

import Controller from '@/controllers/Controller';

import { errorResponse, okResponse } from '@/api/baseResponses';

import FileLogger from '@/loggers/FileLogger';

import Users from '@/database/repositories/Users';
import fileUpload from 'express-fileupload';
import { internal } from '@hapi/boom';

class CsvController extends Controller {
  public constructor(
    users: Users,
    private UPLOADS_PATH = process.env.UPLOADS_PATH,
  ) {
    super('/csv', users);

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post('/', this.loadCsv);
  };

  private loadCsv: RequestHandler<
  {},
  {},
  { phone_number: string }
  > = async (req, res) => {
    try {
      const { files } = req.files!;

      const file = files as unknown as fileUpload.UploadedFile;

      if (!fs.existsSync(`${this.UPLOADS_PATH || '/storage'}`)) {
        fs.mkdirSync(`${this.UPLOADS_PATH || '/storage'}`);
      }

      const destination = `${this.UPLOADS_PATH || '/storage'}/${file.name}`;

      file.mv(destination);

      return res.status(200).json(okResponse());
    } catch (e: unknown) {
      if (e instanceof Error) {
        FileLogger.e(e);
        return res.status(400).json(errorResponse('400', e.message));
      }
      return internal('Internal error');
    }
  };
}

export default CsvController;
