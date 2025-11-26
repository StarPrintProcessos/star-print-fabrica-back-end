import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';

export class PedidoOperacaoDTO {
  tipo: string | null;
  operador_nome: string | null;
  maquina_codigo: number | null;
  operador_turno: string | null;
  metragem_linear: number | null;
  operador_codigo: number | null;
  metragem_quadrada: number | null;
  maquina_designacao: string | null;
  perda_metragem_quadrada: number | null;
}

export class PedidoDadosDatabaseDTO {
  codigo_pedido: number | null;

  cliente_codigo: number | null;
  cliente_nome_fantasia: string | null;
  cliente_razao_social: string | null;

  @Type(() => Date)
  data_pedido: Date | null;

  @Type(() => Date)
  data_finalizacao: Date | null;

  @Type(() => Date)
  data_baixa_pcp: Date | null;

  @Type(() => Date)
  data_previsao: Date | null;

  atraso_investigacao: string | null;
  atraso_motivo: string | null;
  atraso: boolean | null;
  atraso_desconsiderar: boolean | null;
  divergencia_dias_uteis: number | null;

  descricao: string | null;
  eh_amostra: boolean | null;
  acabamento_cold: boolean | null;
  retrabalho: boolean | null;
  redimensionamento: boolean | null;
  desconsiderar_metragem: boolean | null;

  algo_novo: string[] | null;
  algo_novo_texto: string | null;

  cores: number | null;
  pistas_de_corte: number | null;
  metros_por_pacote: number | null;
  quantidade_por_pacote: number | null;
  metragem_linear: number | null;
  unidades_produzidas: number | null;

  material_codigo: number | null;
  materia_prima_codigo: number | null;
  largura_material_mm: number | null;
  nome_materia_prima: string | null;
  tipo_materia_prima: string | null;

  codigo_faca: string | null;
  tipo_faca: string | null;
  largura_faca: number | null;
  altura_faca: number | null;
  colunas_faca: number | null;
  fator_faca: number | null;
  numero_de_dentes_faca: number | null;
  l1_corte_faca: number | null;

  perda_investigacao?: string | null;
  perda_motivo?: string | null;
  perda_justificativa?: string | null;

  operacoes?: Prisma.JsonValue;

  maquina_impressao: string | null;
  maquina_corte: string | null;
  maquina_revisao: string | null;

  segmento: string | null;

  metragem_total_m2: number | null;
  producao_m2: number | null;
  perda_m2: number | null;
  perda_percentual: number | null;

  nc_checklist: boolean | null;
  nc_rastreio: boolean | null;

  validado: boolean | null;

  observacao: string | null;
  pasta_de_arquivamento: string | null;
}

export class PaginatedPedidosDadosDTO {
  page: number;
  limit: number;
  total: number;
  items: PedidoDadosDatabaseDTO[];
}