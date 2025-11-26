import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';

import * as accountTypes from '../constants/account-types';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(accountTypes.ACCOUNT_TYPES)
  accountType?: accountTypes.AccountType;
}