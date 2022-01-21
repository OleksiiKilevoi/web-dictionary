import { ObjectId } from 'mongodb';

class Project {
  public constructor(
    public readonly name: string,
    public readonly createdAt: number,
    public readonly updatedAt: number,
    public readonly dictionary?: object,
    public readonly _id: ObjectId = new ObjectId(),
  ) {}
}

export default Project;
