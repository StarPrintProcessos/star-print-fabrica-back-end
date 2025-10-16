import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../collections/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validatePassword(email, password);
    if (!user) throw new UnauthorizedException('Credenciais inválidas!');
    const payload = { sub: (user as any)._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
