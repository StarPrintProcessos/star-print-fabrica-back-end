import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PedidosFilterInputDTO } from './dto/pedidos-filter-input.dto';
import { pedidosAggregationSteps } from './mappers/pedidos-input-mapper';
import { Pedido, PedidoDocument } from './schemas/pedidos.schema';
import { flattenObject } from 'src/common/utils/flatten-object';

@Injectable()
export class PedidosService {
  constructor(@InjectModel(Pedido.name) private model: Model<PedidoDocument>) { }

  // --- CREATE ---
  async create(payload: Partial<Pedido>): Promise<Pedido> {
    const created = new this.model(payload);
    return created.save();
  }

  // --- PATCH (atualização parcial) ---
  async patch(id: Types.ObjectId, payload: Partial<Pedido>): Promise<Pedido> {
    const flattened = flattenObject(payload);

    const updated = await this.model
      .findByIdAndUpdate(id, { $set: flattened }, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Pedido ${id} não encontrado`);
    return updated;
  }

  // findAll() {
  //     return this.model.find().lean();
  // }

  async findById(_id: Types.ObjectId) {
    const pipeline = [{ $match: { _id } }, ...pedidosAggregationSteps()];

    const [doc] = await this.model.aggregate(pipeline).exec();

    if (!doc) {
      throw new NotFoundException(`Pedido com id ${_id} não encontrado`);
    }

    return doc;
  }

  async findByCodigo(codigo: number) {
    const pipeline = [{ $match: { codigo } }, ...pedidosAggregationSteps()];

    const [doc] = await this.model.aggregate(pipeline).exec();

    if (!doc) {
      throw new NotFoundException(`Pedido com código ${codigo} não encontrado`);
    }

    return doc;
  }

  async findPaged(dto: PedidosFilterInputDTO) {
    dto.page = Math.max(1, Number(dto.page || 1));
    dto.limit = Math.min(200, Math.max(1, Number(dto.limit || 20)));

    const pipeline: any[] = [
      ...pedidosAggregationSteps(dto),
      {
        $project: {
          items: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline).allowDiskUse(true);

    const res = {
      page: dto.page,
      limit: dto.limit,
      total: result?.total ?? 0,
      items: result?.items ?? [],
    };

    return res;
  }

  async metrics(dto: PedidosFilterInputDTO): Promise<any> {
    const pipeline: any[] = [
      ...pedidosAggregationSteps(dto),
      {
        $group: {
          _id: null,
          total_m2: {
            $sum: { $toDouble: '$producao.total_m2' },
          },
          producao_m2: {
            $sum: { $toDouble: '$producao.producao_m2' },
          },
          producao_m: {
            $sum: { $toDouble: '$producao.metragem_linear' },
          },
          atrasos: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$atraso.dias', null] },
                    { $gt: ['$atraso.dias', 0] },
                    { $ne: ['$cliente_codigo', 1] }, // filtra cliente_codigo = 1 (Star Print)
                    { $ne: ['$atraso.desconsiderar', true] }, // filtra atrasos desconsiderados
                  ],
                },
                1,
                0,
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
    ];

    const [res] = await this.model.aggregate(pipeline).exec();

    const total_m2 = res?.total_m2 ?? 0;
    const producao_m2 = res?.producao_m2 ?? 0;
    const perda_m2 = total_m2 - producao_m2;
    const perda_porcentagem = perda_m2 / total_m2;
    const documentos_contabilizados = res?.count ?? 0;
    const atrasos = res?.atrasos ?? 0;
    const atrasos_porcentagem = atrasos / documentos_contabilizados;

    return {
      ini: dto.startDate ?? null,
      fim: dto.endDate ?? null,
      total_m2,
      producao_m2,
      perda_m2,
      perda_porcentagem,
      documentos_contabilizados: res?.count ?? 0,
      atrasos,
      atrasos_porcentagem,
    };
  }

  async update(id: string, dto: Partial<Pedido>) {
    const doc = await this.model
      .findByIdAndUpdate(new Types.ObjectId(id), dto, {
        new: true,
        runValidators: true,
      })
      .lean();
    if (!doc) throw new NotFoundException('Pedido não encontrado');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model
      .findByIdAndDelete(new Types.ObjectId(id))
      .lean();
    if (!doc) throw new NotFoundException('Pedido não encontrado');
    return { ok: true };
  }
}
