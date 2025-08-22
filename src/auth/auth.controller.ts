import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto, SignupResponse } from './dto/signupDto';
import { AuthService } from './auth.service';
import { SigninDto, SigninResponse } from './dto/signinDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signip(@Body() signinDto: SigninDto): Promise<SigninResponse> {
    return this.authService.signin(signinDto);
  }

  @Post('signup')
  signup(@Body() signupDto: SignupDto): Promise<SignupResponse> {
    return this.authService.signup(signupDto);
  }
}
