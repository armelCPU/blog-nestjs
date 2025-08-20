import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto, SignupResponse } from './dto/signupDto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto): Promise<SignupResponse> {
    return this.authService.signup(signupDto);
  }
}
