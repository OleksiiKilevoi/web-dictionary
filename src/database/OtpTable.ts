/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable class-methods-use-this */
import { AbstractTable, ExtractModel } from 'drizzle-orm';

export class OtpsTable extends AbstractTable<OtpsTable> {
  public id = this.serial('id').primaryKey();
  public email = this.varchar('email').notNull();
  public createdAt = this.bigint('created_at', 'max_bytes_53').notNull();
  public otp = this.varchar('otp').notNull();

  public tableName(): string {
    return 'auth_otp';
  }
}

export type OtpModel = ExtractModel<OtpsTable>;
