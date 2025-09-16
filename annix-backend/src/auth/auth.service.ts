import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { email }, relations: ['roles'] });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = await bcrypt.hash(password, user.salt);

    if (hashedPassword === user.password) {
      const { password, salt, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = { sub: user.id, username: user.username, roles: user.roles.map(r => r.name) };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
