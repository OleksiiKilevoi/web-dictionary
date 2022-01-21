import User  from '@/database/models/User';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
