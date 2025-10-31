// pedido-input-dto.ts
import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

// ---------- Helpers de transformação ----------
const toNumber = ({ value }: { value: any }) =>
  value === '' || value === null || value === undefined
    ? undefined
    : (typeof value === 'number' ? value : Number(String(value).replace(',', '.')));

const toBoolean = ({ value }: { value: any }) => {
  if (typeof value === 'boolean') return value;
  if (value === '' || value === null || value === undefined) return undefined;
  const s = String(value).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'sim';
};

const toDate = ({ value }: { value: any }) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(+d) ? undefined : d;
};

const toStringArray = ({ value }: { value: any }) => {
  if (value === null || value === undefined) return undefined;
  if (Array.isArray(value)) return value.map(v => String(v));
  const s = String(value).trim();
  return s ? [s] : undefined;
};

// ---------- Sub-DTOs ----------
export class AtrasoDto {
  @IsOptional() @IsString()
  categoria?: string;

  @IsOptional() @Transform(toBoolean) @IsBoolean()
  desconsiderar?: boolean;

  @IsOptional() @Transform(toNumber) @IsNumber()
  dias?: number;

  @IsOptional() @IsString()
  investigacao?: string;

  @IsOptional() @IsString()
  motivo?: string;
}

export class CortadorItemDto {
  @Transform(toNumber) @IsNumber()
  maquina_codigo!: number;

  @Transform(toNumber) @IsNumber()
  metragem_linear!: number;

  @IsString()
  operador!: string;

  @Transform(toNumber) @IsNumber() @IsOptional()
  perda_metragem_quadrada!: number;
}

export class DatasDto {
  @IsOptional() @Transform(toDate) @IsDate() @IsOptional()
  baixa_pcp?: Date;

  @IsOptional() @Transform(toDate) @IsDate() @IsOptional()
  finalizacao?: Date;

  @Transform(toDate) @IsDate()
  pedido!: Date;

  @Transform(toDate) @IsDate()
  previsao!: Date;
}

export class DetalhesDto {
  @Transform(toBoolean) @IsBoolean()
  acabamento_cold!: boolean;

  @Transform(toBoolean) @IsBoolean()
  amostra!: boolean;

  @Transform(toBoolean) @IsBoolean()
  desconsiderar_metragem!: boolean;

  @Transform(toBoolean) @IsBoolean()
  redimensionamento!: boolean;

  @Transform(toBoolean) @IsBoolean()
  retrabalho!: boolean;
}

export class FacaDto {
  @IsString()
  codigo!: string;

  @Transform(toNumber) @IsNumber() @IsOptional()
  altura?: number;

  @Transform(toNumber) @IsNumber() @IsOptional()
  largura?: number;

  @Transform(toNumber) @IsNumber() @IsOptional()
  colunas?: number;
}

export class ImpressorItemDto {
  @Transform(toNumber) @IsNumber()
  maquina_codigo!: number;

  @Transform(toNumber) @IsNumber()
  metragem_linear!: number;

  @IsString()
  operador!: string;

  @Transform(toNumber) @IsNumber() @IsOptional()
  perda_metragem_quadrada?: number;
}

export class NCDto {
  @Transform(toBoolean) @IsBoolean()
  checklist!: boolean;

  @Transform(toBoolean) @IsBoolean()
  rastreio!: boolean;
}

export class PerdaDto {
  @IsOptional() @IsString()
  investigacao?: string;

  @IsOptional() @IsString()
  justificativa?: string;

  @IsOptional() @IsString()
  motivo?: string;
}

export class ProducaoDto {
  @Transform(toStringArray) @IsArray() @ArrayNotEmpty()
  @IsString({ each: true }) @IsOptional()
  algo_novo?: string[];

  @Transform(toNumber) @IsNumber()
  cores!: number;

  @IsOptional() @Transform(toNumber) @IsNumber()
  material_codigo?: number;

  @Transform(toNumber) @IsNumber()
  metragem_linear!: number;

  @Transform(toNumber) @IsNumber()
  metros_por_pacote!: number;

  @Transform(toNumber) @IsNumber()
  pistas_de_corte!: number;

  @Transform(toNumber) @IsNumber()
  quantidade_por_pacote!: number;

  @Transform(toNumber) @IsNumber()
  unidades_produzidas!: number;
}

export class RevisorItemDto {
  @IsOptional() @Transform(toNumber) @IsNumber()
  maquina_codigo?: number;

  @Transform(toNumber) @IsNumber()
  metragem_linear!: number;

  @IsString()
  operador!: string;
}

// ---------- DTO principal ----------
export class PedidoInputDTO {
  @IsOptional() @ValidateNested() @Type(() => AtrasoDto)
  atraso?: AtrasoDto;

  @Transform(toNumber) @IsNumber()
  cliente_codigo!: number;

  @Transform(toNumber) @IsNumber()
  codigo!: number;

  @ValidateNested() @Type(() => DatasDto)
  datas!: DatasDto;

  @IsOptional() @IsString()
  descricao?: string;

  @ValidateNested() @Type(() => DetalhesDto)
  detalhes!: DetalhesDto;

  @ValidateNested() @Type(() => FacaDto)
  faca!: FacaDto;

  @IsOptional() @ValidateNested() @Type(() => NCDto)
  nc?: NCDto;

  @IsOptional() @IsString()
  observacao?: string;

  @IsOptional() @IsString()
  pasta_de_arquivamento?: string;

  @IsOptional() @ValidateNested() @Type(() => PerdaDto)
  perda?: PerdaDto;

  @ValidateNested() @Type(() => ProducaoDto)
  producao!: ProducaoDto;

  @ValidateNested({ each: true }) @IsOptional() @Type(() => ImpressorItemDto) @IsArray() @ArrayNotEmpty()
  impressores?: ImpressorItemDto[];

  @ValidateNested({ each: true }) @IsOptional()  @Type(() => CortadorItemDto) @IsArray() @ArrayNotEmpty()
  cortadores?: CortadorItemDto[];

  @ValidateNested({ each: true }) @IsOptional() @Type(() => RevisorItemDto) @IsArray() @ArrayNotEmpty()
  revisores?: RevisorItemDto[];

  @IsOptional() @Transform(toBoolean) @IsBoolean()
  validado?: boolean;
}
