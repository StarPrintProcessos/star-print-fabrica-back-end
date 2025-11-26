import { IsBoolean, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PedidosFilterInputDTO  {
  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @IsString()
  busca_cliente?: string;

  @IsOptional()
  @IsString()
  busca_operador?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt({ each: true })
  @Transform(({ value }) => (value as string).split(',').map(v => v.trim()).filter(v => v.length > 0).map(v => Number(v)))
  codigos?: number[];

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => (value as string).split(',').map(v => v.trim()).filter(v => v.length > 0).map(v => Number(v)))
  cliente_codigos?: number[];

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => (value as string).split(',').map(v => v.trim()).filter(v => v.length > 0))
  faca_codigos?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  desconsiderar_metragem?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  amostra?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  retrabalho?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  acabamento_cold?: boolean;

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => (value as string).split(',').map(v => v.trim()).filter(v => v.length > 0))
  tipos_de_servico?: string[];

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => (value as string).split(',').map(v => v.trim()).filter(v => v.length > 0))
  tipos_de_material?: string[];

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => (value as string).split(',').map(v => v.trim()).filter(v => v.length > 0))
  segmentos?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  validado?: boolean;

  @IsOptional() @Type(() => Number) @IsInt()
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  limit?: number;
}
