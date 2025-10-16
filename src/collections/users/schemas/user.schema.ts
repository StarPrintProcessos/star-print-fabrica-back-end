import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export type AccountType = 'admin' | 'manager' | 'operator';

@Schema({ timestamps: true, collection: 'Users' })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // hashed

  @Prop({ required: true, default: 'operator' })
  accountType: AccountType;
}

export const UserSchema = SchemaFactory.createForClass(User);
