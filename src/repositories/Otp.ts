import { OtpModel, OtpsTable } from '@/database/OtpTable';
import { eq } from 'drizzle-orm';

export default class Otp {
  public constructor(private table: OtpsTable) {
  }

  public create = async (otp: OtpModel): Promise<OtpModel> => this.table.insert(otp).findOne();

  public getByEmail = async (email: string): Promise<OtpModel | undefined> => {
    try {
      const result = await this.table
        .select()
        .where(eq(this.table.email, email))
        .findOne();
      return result;
    } catch (e) {
      return undefined;
    }
  };

  public update = async (otp: string, email:string): Promise<OtpModel> => this.table.update()
    .where(eq(this.table.email, email))
    .set({ otp, createdAt: Date.now() })
    .findOne();
}
