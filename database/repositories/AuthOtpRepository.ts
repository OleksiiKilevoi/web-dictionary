import { Collection, MongoClient, ObjectId } from 'mongodb';
import AuthOtp from '../models/authOtp';

class AuthOtpRepository {
  private authOtp: Collection<AuthOtp>;

  public constructor(mongoClient: MongoClient) {
    this.authOtp = mongoClient.db().collection('authOtp');
  }

  public getAll = () => this.authOtp.find({ deleted: false }).toArray();


  public getById = (userId: string) => (
    this.authOtp.findOne(
      { _id: new ObjectId(userId), deleted: false },
    ));

  public create = (user: AuthOtp) => this.authOtp.insertOne(user).then((item) => item.ops[0]);

  public update = (id: string, update: Partial<AuthOtp>) => (
    this.authOtp.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
    ));

  public getByPhoneNumber = (phone: string) => this.authOtp.findOne({ phone });

  public updateOtp = (phone: string, otp: string) => this.authOtp.updateOne({ phone }, { $set: { otp }})
}

export default AuthOtpRepository;
