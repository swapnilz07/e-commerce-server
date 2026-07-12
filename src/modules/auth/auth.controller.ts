import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and return JWT' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This redirects the user to Google's consent screen
    // No code needed here - Passport handles it automatically
  }

  // 2. Google OAuth Callback (where Google redirects back to)
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // req.user contains the user from GoogleStrategy's validate() method
    const result = await this.authService.oauthLogin(req.user);

    // In production, redirect to frontend with the JWT token (e.g., via URL param)
    // Option 1: Redirect to frontend with token in query string
    return res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${result.accessToken}`
    );
  }

  // @Get('me')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get current user profile' })
  // @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  // @ApiResponse({ status: 401, description: 'Unauthorized.' })
  // async getProfile(@Request() req) {
  //   return req.user;
  // }

  // @Get('admin-only')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Admin only access test endpoint' })
  // @ApiResponse({ status: 200, description: 'Access granted.' })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // async adminOnly() {
  //   return { message: 'Welcome Admin! You have access to this resource.' };
  // }
}
