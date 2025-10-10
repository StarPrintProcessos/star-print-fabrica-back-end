import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClienteDocument = HydratedDocument<Cliente>;

@Schema({ collection: 'Clientes' })
export class Cliente {
  @Prop({ type: Types.ObjectId })
  _id?: Types.ObjectId;

  @Prop({ required: true, type: Number })
  codigo!: number;

  @Prop({ required: true, type: String })
  nome_fantasia!: string;

  @Prop({ required: true, type: String })
  razao_social!: string;

  @Prop({ type: String, default: null })
  contato_compras?: string | null;

  @Prop({ type: String, default: null })
  contato_financeiro?: string | null;

  @Prop({ type: String, default: null })
  email?: string | null;

  @Prop({ type: String, default: null })
  fone_1?: string | null;

  @Prop({ type: String, default: null })
  fone_2?: string | null;

  @Prop({ type: String, default: null })
  vendedor?: string | null;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);

// índice opcional para garantir unicidade do código do cliente
ClienteSchema.index({ codigo: 1 }, { unique: true });

// (Opcional) normalização simples antes de salvar
ClienteSchema.pre('save', function (next) {
  const trim = (v?: string | null) =>
    typeof v === 'string' ? v.trim() || null : v;

  this.contato_compras = trim(this.contato_compras);
  this.contato_financeiro = trim(this.contato_financeiro);
  this.email = trim(this.email);
  this.fone_1 = trim(this.fone_1);
  this.fone_2 = trim(this.fone_2);
  this.nome_fantasia = trim(this.nome_fantasia) || '';
  this.razao_social = trim(this.razao_social) || '';
  this.vendedor = trim(this.vendedor);

  next();
});
