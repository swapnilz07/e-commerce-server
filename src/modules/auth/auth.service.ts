import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    const user = await this.userService.createNewUser(
      email,
      password,
      firstName,
      lastName,
    );

    // Generate JWT token for the newly registered user
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user,
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Validate user credentials
    const user = await this.userService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid email or password');


    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user,
      accessToken: token,
    };
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
