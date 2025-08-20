import { IsNotEmpty, IsEmail } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}

export interface SignupResponse {
  message: string;
  userId: number;
  email: string;
  name: string;
  username: string;
}
