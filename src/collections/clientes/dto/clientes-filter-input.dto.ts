import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ClientesFilterInputDTO  {
  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @IsInt({ each: true })
  @Transform(({ value }) => (value as string).split(',').map(v => v.trim()).filter(v => v.length > 0).map(v => Number(v)))
  codigos?: number[];

  @IsOptional() @Type(() => Number) @IsInt()
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  limit?: number;
}
