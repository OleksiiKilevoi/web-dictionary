import { UserModel } from '@/database/UsersTable';

declare global {
  namespace Express {
    export interface Request {
      user?: UserModel;
    }
  }
}
