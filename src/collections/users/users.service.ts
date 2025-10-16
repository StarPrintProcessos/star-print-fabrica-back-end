import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createDto: CreateUserDto) {
    const exists = await this.userModel.findOne({ email: createDto.email });
    if (exists) throw new BadRequestException('Email já está em uso!');
    const hashed = await bcrypt.hash(createDto.password, 10);
    const created = new this.userModel({ ...createDto, password: hashed });
    return created.save();
  }

  async findById(id: string) {
    const _id =new Types.ObjectId(id);
    return this.userModel.findOne({ _id }).exec();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async validatePassword(email: string, plain: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(plain, user.password);
    if (!match) return null;
    // do not return password
    const { password, ...safe } = user.toObject();
    return safe;
  }
}
