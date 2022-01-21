import { ObjectId } from 'mongodb';

class AuthOtpRepository {
  public constructor(
    public readonly phone: string,
    public readonly createdAt: number,
    public readonly updatedAt: number,
    public readonly issuedAt: number,
    public readonly otp: string,
    public readonly _id: ObjectId = new ObjectId(),
  ) {}
}

export default AuthOtpRepository;