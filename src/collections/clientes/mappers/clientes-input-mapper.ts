import { ClientesFilterInputDTO } from '../dto/clientes-filter-input.dto';
import { ClientesFilterQuery } from '../schemas/clientes-filter-query';

export function clientesAggregationSteps(
  dto: ClientesFilterInputDTO = {},
): any[] {
  const aggregationSteps: any = [];

  if (!dto.busca) {
    aggregationSteps.push({ $sort: { codigo: 1 } });
  } else {
    aggregationSteps.push({ $sort: { nome_fantasia: 1 } });
  }

  const filter = mapInputToFilter(dto);

  if (Object.keys(filter).length) {
    aggregationSteps.push({
      $match: filter,
    });
  }

  if (dto.limit && dto.page) {
    const { page, limit } = dto;

    const skip = (page - 1) * limit;

    const itemsSteps: any = [
      { $skip: skip },
      { $limit: limit }
    ];

    aggregationSteps.push({
      $facet: {
        total: [{ $count: 'count' }],
        items: itemsSteps,
      },
    });
  }

  return aggregationSteps;
}

function mapInputToFilter(dto: ClientesFilterInputDTO): ClientesFilterQuery {
  const filter: ClientesFilterQuery = {};

  if (dto.busca) {
    const busca = dto.busca.trim();

    const regexObj = { $regex: busca, $options: 'i' };

    if (busca.length > 0) {
      filter.$or = [
        {
          $expr: {
            $regexMatch: {
              input: { $toString: '$codigo' }, // converte numero para string
              regex: busca,
              options: 'i',
            },
          },
        },
        { nome_fantasia: regexObj }
      ];
    }
  }

  if (dto.codigos?.length) {
    filter.codigo = { $in: dto.codigos };
  }

  return filter;
}
