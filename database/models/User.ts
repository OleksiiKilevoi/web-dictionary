import { ObjectId } from 'mongodb';

class User {
  public constructor(
    public readonly phone: string,
    public readonly createdAt: number,
    public readonly updatedAt: number,
    public readonly name?: string,
    public readonly _id: ObjectId = new ObjectId(),
  ) {}
}

export default User;
