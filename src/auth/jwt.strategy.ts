import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as dotenv from 'dotenv';
import { UsersService } from 'src/collections/users/users.service';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback_secret',
    });
  }

  async validate(payload: any) {
    // Você pode buscar o usuário no banco para garantir dados atualizados:
    const user = await this.usersService.findById(payload.sub);
    // Retorne o que quer ter em req.user:
    return { userId: payload.sub, email: payload.email, accountType: user?.accountType };
  }
}
