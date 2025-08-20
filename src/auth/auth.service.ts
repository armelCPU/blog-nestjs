/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { SignupDto, SignupResponse } from './dto/signupDto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async signup(signupDto: SignupDto): Promise<SignupResponse> {
    // Destructuring of the dto object
    const { email, password, username, name } = signupDto;

    // Find if the user exists
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (user) throw new ConflictException('User already Exists');

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // save user in the DB
    const newUser = await this.prismaService.user.create({
      data: {
        email,
        username,
        name,
        password: hashPassword,
      },
    });

    return {
      message: 'User successfully created',
      userId: newUser.userId,
      email: newUser.email,
      name: newUser.name,
      username: newUser.username,
    };
  }
}
