import { IsNotEmpty, IsEmail } from 'class-validator';

export class SigninDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}

export interface SigninResponse {
  sub: number;
  token: string;
  email: string;
  name: string;
  username: string;
}
