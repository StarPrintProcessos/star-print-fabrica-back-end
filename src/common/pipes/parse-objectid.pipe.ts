import { BadRequestException, PipeTransform } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException('ObjectId inválido (esperado 24 hex).');
    }

    return new Types.ObjectId(value);
  }
}
