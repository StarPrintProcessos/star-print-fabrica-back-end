import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type PedidoDocument = HydratedDocument<Pedido>;

class Atraso {
  @Prop() categoria?: string;
  @Prop() desconsiderar?: boolean;
  @Prop({ required: true }) dias!: number;
  @Prop() investigacao?: string;
  @Prop() motivo?: string;
}

class CortadorItem {
  @Prop({ required: true }) maquina_codigo!: number;
  @Prop({ required: true, type: Number }) metragem_linear!: number;
  @Prop({ required: true }) operador!: string;
  @Prop({ required: true, type: Number }) perda_metragem_quadrada!: number;
}

class Datas {
  @Prop({ type: Date })
  baixa_pcp: Date;
  
  @Prop({ type: Date })
  finalizacao: Date;

  @Prop({ required: true, type: Date })
  pedido!: Date;
}

class Detalhes {
  @Prop() tipo_de_servico?: string;
  @Prop({ required: true }) acabamento_cold!: boolean;
  @Prop({ required: true }) amostra!: boolean;
  @Prop({ required: true }) desconsiderar_metragem!: boolean;
  @Prop({ required: true }) redimensionamento!: boolean;
  @Prop({ required: true }) retrabalho!: boolean;
}

class Faca {
  @Prop({ required: true }) codigo!: string;
  @Prop({ required: true }) altura!: number;
  @Prop({ required: true }) largura!: number;
  @Prop({ required: true }) colunas!: number;
}

class ImpressorItem {
  @Prop({ required: true }) maquina_codigo!: number;
  @Prop({ required: true, type: Number }) metragem_linear!: number;
  @Prop({ required: true }) operador!: string;
  @Prop({ required: true, type: Number }) perda_metragem_quadrada!: number;
}

class NC {
  @Prop({ required: true }) checklist!: boolean;
  @Prop({ required: true }) rastreio!: boolean;
}

class Perda {
  @Prop({ required: true }) investigacao!: string;
  @Prop() justificativa?: string;
  @Prop({ required: true }) motivo!: string;
}

class Producao {
  @Prop({ required: true }) algo_novo!: string[];
  @Prop({ required: true }) cores!: number;
  @Prop() material_codigo?: number;
  @Prop({ type: MongooseSchema.Types.Mixed, default: null }) material_largura?: any; // null no seu schema
  @Prop({ required: true }) material_largura_mm!: number;
  @Prop({ required: true }) material_nome!: string;
  @Prop({ required: true, type: Number }) metragem_linear!: number;
  @Prop({ required: true, type: Number }) metros_por_pacote!: number;
  @Prop({ required: true }) pistas_de_corte!: number;
  @Prop({ required: true }) quantidade_por_pacote!: number;
  @Prop({ required: true }) unidades_produzidas!: number;
}

class RevisorItem {
  @Prop({ type: Number }) maquina_codigo?: number;
  @Prop({ required: true, type: Number }) metragem_linear!: number;
  @Prop({ required: true }) operador!: string;
}

@Schema({ 
  timestamps: true,
  collection: 'Pedidos' }) // <- usa sua coleção
export class Pedido {
  @Prop({ type: Types.ObjectId }) _id?: Types.ObjectId;

  @Prop({ required: true, type: Atraso }) atraso!: Atraso;

  @Prop({ required: true }) cliente_codigo!: number;

  @Prop({ required: true }) codigo!: number;

  @Prop({ required: true, type: [CortadorItem] }) cortadores!: CortadorItem[];

  @Prop({ required: true, type: Datas }) datas!: Datas;

  @Prop() descricao?: string;

  @Prop({ required: true, type: Detalhes }) detalhes!: Detalhes;
  
  @Prop({ required: true, type: Faca }) faca!: Faca;

  @Prop({ required: true, type: [ImpressorItem] }) impressores!: ImpressorItem[];

  @Prop({ type: NC }) nc?: NC;

  @Prop() observacao?: string;

  @Prop() pasta_de_arquivamento?: string;

  @Prop({ required: true, type: Perda }) perda!: Perda;

  @Prop({ required: true, type: Producao }) producao!: Producao;

  @Prop({ required: true, type: [RevisorItem] }) revisores!: RevisorItem[];

  @Prop({ required: true }) validado!: boolean;
}

export const PedidoSchema = SchemaFactory.createForClass(Pedido);

// (Opcional) normalizações simples antes de salvar
PedidoSchema.pre('save', function (next) {

  formatPedido(this);

  next();
});

export function formatPedido(obj: any): Pedido {
  const toNum = (v: any) => (typeof v === 'string' && v.trim() !== '' ? Number(v) : v);
  const toDate = (v: any) => {
    if (!v) return v;
    if (v instanceof Date) return v;
    const parsed = new Date(v);
    return isNaN(parsed.getTime()) ? v : parsed;
  };

  // Conversões numéricas
  obj.cortadores?.forEach((c: any) => {
    c.metragem_linear = toNum(c.metragem_linear);
    c.perda_metragem_quadrada = toNum(c.perda_metragem_quadrada);
  });
  obj.impressores?.forEach((i: any) => {
    i.metragem_linear = toNum(i.metragem_linear);
    i.perda_metragem_quadrada = toNum(i.perda_metragem_quadrada);
  });
  obj.revisores?.forEach((r: any) => {
    r.metragem_linear = toNum(r.metragem_linear);
  });
  if (obj.producao) {
    obj.producao.metragem_linear = toNum(obj.producao.metragem_linear);
    obj.producao.metros_por_pacote = toNum(obj.producao.metros_por_pacote);
  }

  // Conversão de datas
  if (obj.datas) {
      obj.datas.pedido = toDate(obj.datas.pedido);
      obj.datas.baixa_pcp = toDate(obj.datas.baixa_pcp);
      obj.datas.finalizacao = toDate(obj.datas.finalizacao);
  }

  return obj;
}
