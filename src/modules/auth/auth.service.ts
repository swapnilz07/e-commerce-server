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

  // NEW: Handle OAuth user validation
  async validateOAuthUser(oauthData: { googleId: string; email: string; firstName: string; lastName: string }) {
    const { googleId, email, firstName, lastName } = oauthData;

    // 1. Check if user already exists with this email
    const user = await this.userService.findByEmail(email) as any;

    if (user) {
      // 2. User exists. If they don't have a googleId, link it (optional, but good for UX).
      if (!user.googleId) {
        // If they signed up with password earlier, we link the Google account
        // Note: This means they can now login with Google OR password.
        // We need a method in UserService to update googleId.
        // For now, if user exists, we just log them in.
        // (Production: you might merge accounts, or just return the user.)
        const { password, ...result } = user;
        return result;
      }

      // If they already have a googleId, just return them.
      const { password, ...result } = user;
      return result;
    }

    // 3. User does NOT exist -> Create a new user (without a password)
    const newUser = await this.userService.createOAuthUser({
      email,
      googleId,
      firstName,
      lastName,
    }) as any;

    const { passwordHash, ...result } = newUser;
    return result;
  }

  // NEW: Login method specifically for OAuth (called after validation)
  async oauthLogin(user: any) {
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
