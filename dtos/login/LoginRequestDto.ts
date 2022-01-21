import { IsEmail, IsBase64 } from 'class-validator';

class LoginRequestDto {
  @IsEmail()
  public email!: string;

  @IsBase64()
  public password!: string;
}

export default LoginRequestDto;
