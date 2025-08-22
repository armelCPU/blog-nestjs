import { IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: 'john_doe', description: 'email of the user' })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'ABCD ...', description: 'password of the user' })
  readonly password: string;
}

export interface SigninResponse {
  sub: number;
  token: string;
  email: string;
  name: string;
  username: string;
}
