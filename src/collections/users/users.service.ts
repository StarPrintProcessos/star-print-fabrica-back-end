import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateUserDto) {
    const exists = await this.prisma.users.findUnique({
      where: { email: createDto.email },
    });

    if (exists) {
      throw new BadRequestException('Email já está em uso!');
    }

    const hashed = await bcrypt.hash(createDto.password, 10);

    return this.prisma.users.create({
      data: {
        ...createDto,
        password: hashed,
      },
    });
  }

  async findById(id: string | number) {
    const userId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (Number.isNaN(userId)) {
      throw new BadRequestException('ID inválido');
    }

    return this.prisma.users.findUnique({
      where: { codigo: userId },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async validatePassword(email: string, plain: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(plain, user.password || '');
    if (!match) return null;

    // Remove password antes de retornar
    const { password, ...safe } = user;
    return safe;
  }
}