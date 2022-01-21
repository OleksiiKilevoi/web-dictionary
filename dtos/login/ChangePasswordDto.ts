import { IsBase64 } from 'class-validator';

class ChangePasswordDto {
  @IsBase64()
  public oldPassword!: string;

  @IsBase64()
  public newPassword!: string;
}

export default ChangePasswordDto;
