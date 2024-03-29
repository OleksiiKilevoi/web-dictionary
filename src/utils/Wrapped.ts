/* eslint-disable consistent-return */
import { errorResponse } from '@/api/baseResponses';
import FileLogger from '@/loggers/FileLogger';
import BotLogger from '@/loggers/BotLogger';

import { RequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrapped = (callback: any): RequestHandler => async (req, res, next) => {
  try {
    await callback(req, res, next);
  } catch (e) {
    if (e instanceof Error) {
      // const logger = new BotLogger();
      FileLogger.e(e);
      BotLogger.log(e.message);
      console.error(e);

      return res.status(404).json(errorResponse('404', e.message));
    }
    return res.status(500).json(errorResponse('500', 'Internal unknown error'));
  }
};

export default wrapped;
