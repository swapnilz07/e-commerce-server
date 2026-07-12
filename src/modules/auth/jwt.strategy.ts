import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') as string,
    });
  }

  async validate(payload: any) {
    // Payload contains { sub: userId, email, role }
    const user = await this.userService.findUserById(payload.sub);

    if (!user) throw new UnauthorizedException('User no longer exists');
    if (!user.isActive) throw new UnauthorizedException('User account is inactive');

    // Exclude password from the user object
    const { password, ...result } = user;
    return result;
  }
}
