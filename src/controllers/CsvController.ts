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
    this.router.get('/', this.loadCsv);
  };

  private loadCsv: RequestHandler = async (req, res) => {
    try {
      const { files } = req.files!;

      const file = files as unknown as fileUpload.UploadedFile;

      if (!fs.existsSync(`${this.UPLOADS_PATH || '/storage'}`)) {
        fs.mkdirSync(`${this.UPLOADS_PATH || '/storage'}`);
      }

      const destination = `${this.UPLOADS_PATH || '/storage'}/${file.name}`;
      const csvf = fs.readFileSync(destination);

      const rowArray = csvf.toString().split('\r\n');
      const array = rowArray.map((row) => row.split(','));

      const result: {[key: string]: {[key: string]: string}} = {};
      for (let i = 1; i < array.length; i += 1) {
        result[array[i][0]] = {};
        for (let j = 1; j < array[i].length; j += 1) {
          result[array[i][0]][array[0][j]] = array[i][j];
        }
      }

      console.log(result);

      fs.writeFileSync('output.json', JSON.stringify(result));

      return res.status(200).json(okResponse(result));
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
