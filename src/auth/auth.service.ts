/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { SignupDto, SignupResponse } from './dto/signupDto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SigninDto, SigninResponse } from './dto/signinDto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
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

  async signin(signinDto: SigninDto): Promise<SigninResponse> {
    const { email, password } = signinDto;

    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Check your credentials');
    if (!user.password) throw new BadRequestException('Check your credentials');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Your are not authenticated');
    const payload = {
      sub: user.userId,
      email: user.email,
      name: user.name,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '2h',
      secret: this.configService.get('SECRET_KEY'),
    });
    return {
      token: token,
      email: user.email,
      name: user.name,
      username: user.username,
    };
  }
}
