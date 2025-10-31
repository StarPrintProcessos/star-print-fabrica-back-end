import {
    IsEmail,
    IsIn,
    IsString,
    MinLength
} from 'class-validator';
import * as userSchema from '../schemas/user.schema';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(userSchema.ACCOUNT_TYPES)
  accountType: userSchema.AccountType;
}
