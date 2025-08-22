import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SignupDto, SignupResponse } from './dto/signupDto.dto';
import { AuthService } from './auth.service';
import { SigninDto, SigninResponse } from './dto/signinDto.dto.';
import { AuthGuard } from '@nestjs/passport';
import express from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signin(@Body() signinDto: SigninDto): Promise<SigninResponse> {
    return this.authService.signin(signinDto);
  }

  @Post('signup')
  signup(@Body() signupDto: SignupDto): Promise<SignupResponse> {
    return this.authService.signup(signupDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  @ApiBearerAuth()
  deleteAccount(@Req() request: express.Request) {
    const user = request.user as { userId: number; username: string };

    return user;
  }
}
