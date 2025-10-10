import { FilterQuery } from 'mongoose';
import { ClienteDocument } from './clientes.schema';

export interface ClientesFilterQuery extends FilterQuery<ClienteDocument> {
  codigo?: { $in: number[] };
}
