import { Collection, MongoClient, ObjectId } from 'mongodb';

import User from '../models/User';


class UsersRepository {
  private users: Collection<User>;

  public constructor(mongoClient: MongoClient) {
    this.users = mongoClient.db().collection('users');
  }

  public getAll = () => this.users.find({ deleted: false }).toArray();


  public getById = (userId: string) => (
    this.users.findOne(
      { _id: new ObjectId(userId), deleted: false },
    ));

  public create = (user: User) => this.users.insertOne(user).then((item) => item.ops[0]);

  public update = (id: string, update: Partial<User>) => (
    this.users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
    ));

  public getByPhoneNumber = (phone: string) => this.users.findOne({ phone });

  public updateOtp = (phone: string, otp: string) => this.users.updateOne({ phone }, { $set: { otp }})
}

export default UsersRepository;
