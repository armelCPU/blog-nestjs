import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePostIn {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  title: string;

  @IsString()
  body: string;
}
