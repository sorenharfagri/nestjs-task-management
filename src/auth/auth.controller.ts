import { Controller, Post, Body, ValidationPipe, UseGuards } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

import { User } from './user/user.entity';
import { GetUser } from './user/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  /*
    Регистрация пользователя
  */

  @Post('/signup')
  signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }

  /*
    Логин, получение access токена
  */

  @Post('/signin')
  signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  /*
    Тест на владение актуальным access токеном
  */

  @Post('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() user: User) {
    return {
      status: 'Token is valid'
    }
  }
}
