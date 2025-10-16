import {
    IsEmail,
    IsIn,
    IsString,
    MinLength
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['admin', 'manager', 'operator'])
  accountType: 'admin' | 'manager' | 'operator';
}
