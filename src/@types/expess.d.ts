import { UserModel } from '@/database/UserTable';

declare global {
  namespace Express {
    export interface Request {
      user?: UserModel;
    }
  }
}
