import { FilterQuery } from 'mongoose';
import { PedidoDocument } from './pedidos.schema';

export interface PedidosPrimaryFilterQuery extends FilterQuery<PedidoDocument> {
  'datas.finalizacao'?: {
    $gte?: Date;
    $lt?: Date;
  };
  codigo?: { $in: number[] };
  cliente_codigo?: { $in: number[] };
  'faca.codigo'?: { $in: string[] };
  detalhes?: {
    desconsiderar_metragem?: boolean;
    amostra?: boolean;
    retrabalho?: boolean;
  };
}

export interface PedidosSecondaryFilterQuery extends FilterQuery<PedidoDocument> {
  'detalhes.segmento'?: { $in: string[] };
  'detalhes.tipos_de_servico'?: { $in: string[] };
}
