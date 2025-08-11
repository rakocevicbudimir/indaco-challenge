import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUser } from './decorators/get-user.decorator';
import { JwtUser } from './types/jwt.types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Registers a new user with the provided email and password',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully registered',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login a user',
    description: 'Logs in a user with the provided email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get the current user',
    description: 'Returns the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'The current user has been successfully returned',
  })
  @UseGuards(JwtAuthGuard)
  me(@GetUser() user: JwtUser) {
    return this.authService.me(user);
  }
}
