import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientesFilterInputDTO } from './dto/clientes-filter-input.dto';
import { clientesAggregationSteps } from './mappers/clientes-input-mapper';
import { Cliente, ClienteDocument } from './schemas/clientes.schema';

@Injectable()
export class ClientesService {
  constructor(
    @InjectModel(Cliente.name) private model: Model<ClienteDocument>,
  ) {}

  create(dto: Partial<Cliente>) {
    return this.model.create(dto);
  }

  // findAll() {
  //     return this.model.find().lean();
  // }

  async findById(_id: Types.ObjectId) {
    const pipeline = [{ $match: { _id } }, ...clientesAggregationSteps()];

    const [doc] = await this.model.aggregate(pipeline).exec();

    if (!doc) {
      throw new NotFoundException(`Cliente com id ${_id} não encontrado`);
    }

    return doc;
  }

  async findByCodigo(codigo: number) {
    const pipeline = [{ $match: { codigo } }, ...clientesAggregationSteps()];

    const [doc] = await this.model.aggregate(pipeline).exec();

    if (!doc) {
      throw new NotFoundException(
        `Cliente com código ${codigo} não encontrado`,
      );
    }

    return doc;
  }

  async findPaged(dto: ClientesFilterInputDTO) {
    dto.page = Math.max(1, Number(dto.page || 1));
    dto.limit = Math.min(200, Math.max(1, Number(dto.limit || 20)));

    const pipeline: any[] = [
      ...clientesAggregationSteps(dto),
      {
        $project: {
          items: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline).allowDiskUse(true);
    return {
      page: dto.page,
      limit: dto.limit,
      total: result?.total ?? 0,
      items: result?.items ?? [],
    };
  }

  async getList(
    dto?: ClientesFilterInputDTO,
  ): Promise<{ _id: Types.ObjectId; codigo: number; nome_fantasia: string }[]> {
    const limit = 20; // limite defensivo

    // Reusa o mapper para aplicar busca/codigo caso fornecido.
    // clientesAggregationSteps retorna [] se não há filtros — então pipeline funcionará.
    const pipeline: any[] = [
      ...clientesAggregationSteps(dto ?? ({} as any)),
      {
        $project: {
          _id: 1,
          codigo: 1,
          nome_fantasia: 1,
        },
      },
      { $limit: limit },
    ];

    const result = await this.model
      .aggregate(pipeline)
      .allowDiskUse(true)
      .exec();
    return result as {
      _id: Types.ObjectId;
      codigo: number;
      nome_fantasia: string;
    }[];
  }

  async update(id: string, dto: Partial<Cliente>) {
    const doc = await this.model
      .findByIdAndUpdate(new Types.ObjectId(id), dto, {
        new: true,
        runValidators: true,
      })
      .lean();
    if (!doc) throw new NotFoundException('Cliente não encontrado');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model
      .findByIdAndDelete(new Types.ObjectId(id))
      .lean();
    if (!doc) throw new NotFoundException('Cliente não encontrado');
    return { ok: true };
  }
}
