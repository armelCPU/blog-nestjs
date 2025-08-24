import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePostIn {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}

export class CreatePostOut {
  id: number;
  title: string;
  slug: string;
  body: string;
}
