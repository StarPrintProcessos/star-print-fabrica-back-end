import { PedidosFilterInputDTO } from '../dto/pedidos-filter-input.dto';
import {
  PedidosPrimaryFilterQuery,
  PedidosSecondaryFilterQuery,
} from '../schemas/pedidos-filter-query';
import { DateTime } from 'luxon';

const lookupsCliente = [
  // 0) flag: existe cliente_codigo?
  {
    $set: {
      __has_cliente_codigo: {
        $ne: [{ $ifNull: ['$cliente_codigo', null] }, null],
      },
    },
  },

  // 1) Lookup normal (executa sempre — não dá para condicionar a execução do stage)
  {
    $lookup: {
      from: 'Clientes',
      let: { codigoLocal: '$cliente_codigo' },
      pipeline: [
        { $match: { $expr: { $eq: ['$codigo', '$$codigoLocal'] } } },
        { $limit: 1 },
      ],
      as: 'cliente_arr',
    },
  },

  // 2) Transformar array em objeto único — só atribui se __has_cliente_codigo for true
  {
    $set: {
      cliente: {
        $cond: [
          '$__has_cliente_codigo', // se existe cliente_codigo
          { $arrayElemAt: ['$cliente_arr', 0] }, // então atribui o resultado do lookup
          '$cliente', // senão mantém o valor existente
        ],
      },
    },
  },

  // 3) remover array temporário e cliente_codigo
  { $unset: ['cliente_arr', 'cliente_codigo', '__has_cliente_codigo'] },
];

const lookupsFaca = [
  // 1) Lookup normal
  {
    $lookup: {
      from: 'Facas',
      let: { codigoLocal: '$faca.codigo' },
      pipeline: [
        { $match: { $expr: { $eq: ['$codigo', '$$codigoLocal'] } } },
        { $limit: 1 },
      ],
      as: 'faca_arr',
    },
  },

  // 2) Transformar array em objeto único, mas manter o original se for Digital
  {
    $set: {
      faca: {
        $cond: [
          { $eq: ['$faca.codigo', 'Digital'] },
          '$faca', // mantém o objeto original para Digital
          { $arrayElemAt: ['$faca_arr', 0] }, // usa o lookup para outros códigos
        ],
      },
    },
  },

  // 3) remover array temporário
  {
    $unset: ['faca_arr'],
  },
];

const lookupsMaterial = [
  // 1) Lookup para "Materiais" pelo campo codigo (só se material_codigo existir)
  {
    $lookup: {
      from: 'Materiais',
      let: { codigoLocal: '$producao.material_codigo' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $ne: ['$$codigoLocal', null] }, // só roda se existir
                { $eq: ['$codigo', '$$codigoLocal'] },
              ],
            },
          },
        },
        { $limit: 1 },
      ],
      as: 'producao.material_arr',
    },
  },

  // 2) Usa o lookup apenas se 'producao.material' ainda não existir
  {
    $addFields: {
      'producao.material': {
        $ifNull: [
          '$producao.material',
          { $arrayElemAt: ['$producao.material_arr', 0] },
        ],
      },
    },
  },

  // 3) Lookup para "Matérias-Primas" (só se materia_prima_id existir)
  {
    $lookup: {
      from: 'Matérias-Primas',
      let: {
        mid: '$producao.material.materia_prima_id',
        // tenta converter para ObjectId apenas se for string
        midObj: {
          $cond: [
            {
              $eq: [{ $type: '$producao.material.materia_prima_id' }, 'string'],
            },
            { $toObjectId: '$producao.material.materia_prima_id' },
            '$producao.material.materia_prima_id',
          ],
        },
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $ne: ['$$mid', null] }, // só roda se existir
                { $eq: ['$_id', '$$midObj'] },
              ],
            },
          },
        },
        { $limit: 1 },
      ],
      as: 'producao.material.materia_prima_arr',
    },
  },

  // 4) Usa o lookup apenas se 'producao.material.materia_prima' ainda não existir
  {
    $addFields: {
      'producao.material.materia_prima': {
        $ifNull: [
          '$producao.material.materia_prima',
          { $arrayElemAt: ['$producao.material.materia_prima_arr', 0] },
        ],
      },
    },
  },

  // 5) Limpeza de temporários — torna o pipeline idempotente
  {
    $unset: [
      'producao.material_arr',
      'producao.material.materia_prima_arr',
      'producao.material.ativo',
      'producao.material.materia_prima_id',
      'producao.material_codigo',
    ],
  },
];

function lookupsMaquinaArray(arrayName: string) {
  return [
    // 1) unwind
    { $unwind: { path: `$${arrayName}`, preserveNullAndEmptyArrays: true } },

    // 2) lookup na coleção Máquinas
    {
      $lookup: {
        from: 'Máquinas',
        localField: `${arrayName}.maquina_codigo`,
        foreignField: 'codigo',
        as: `${arrayName}.maquina_obj`,
      },
    },

    // 3) transformar array em objeto único
    {
      $addFields: {
        [`${arrayName}.maquina`]: {
          $arrayElemAt: [`$${arrayName}.maquina_obj`, 0],
        },
      },
    },

    // 4) remover campos temporários
    { $unset: [`${arrayName}.maquina_obj`, `${arrayName}.maquina_codigo`] },

    // 5) reconstruir array filtrando objetos vazios
    {
      $group: {
        _id: '$_id',
        [arrayName]: { $push: `$${arrayName}` },
        doc: { $first: '$$ROOT' },
      },
    },

    // 6) filtrar elementos vazios
    {
      $addFields: {
        [arrayName]: {
          $filter: {
            input: `$${arrayName}`,
            as: 'i',
            cond: { $gt: [{ $size: { $objectToArray: '$$i' } }, 0] },
          },
        },
      },
    },

    // 7) reconstruir documento
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ['$doc', { [arrayName]: `$${arrayName}` }],
        },
      },
    },

    // 8) remover array se vazio
    {
      $set: {
        [arrayName]: {
          $cond: [
            { $gt: [{ $size: `$${arrayName}` }, 0] },
            `$${arrayName}`,
            '$$REMOVE',
          ],
        },
      },
    },
  ];
}

const lookupsMaquinaImpressores = lookupsMaquinaArray('impressores');
const lookupsMaquinaCortadores = lookupsMaquinaArray('cortadores');
const lookupsMaquinaRevisores = lookupsMaquinaArray('revisores');

function campoCalculadoMetragemQuadradaOperadores(arrayName) {
  return [
    { $unwind: { path: `$${arrayName}`, preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        [`${arrayName}.metragem_quadrada`]: {
          $cond: [
            // Condição: só calcula se o campo existir (não null / não ausente)
            { $ne: [{ $ifNull: [`$${arrayName}`, null] }, null] },

            // Então → faz o cálculo
            {
              $multiply: [
                { $toDouble: `$${arrayName}.metragem_linear` },
                {
                  $divide: [
                    { $toDouble: '$producao.material.largura_mm' },
                    1000,
                  ],
                },
              ],
            },
            // Senão → mantém o valor atual (ou null, se não existir)
            `$${arrayName}.metragem_quadrada`,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        [arrayName]: { $push: `$${arrayName}` },
        doc: { $first: '$$ROOT' },
      },
    },
    {
      $addFields: {
        [arrayName]: {
          $filter: {
            input: `$${arrayName}`,
            as: 'i',
            cond: { $gt: [{ $size: { $objectToArray: '$$i' } }, 0] },
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ['$doc', { [arrayName]: `$${arrayName}` }],
        },
      },
    },
  ];
}

const campoCalculadoMetragemQuadradaImpressores =
  campoCalculadoMetragemQuadradaOperadores('impressores');
const campoCalculadoMetragemQuadradaCortadores =
  campoCalculadoMetragemQuadradaOperadores('cortadores');
const campoCalculadoMetragemQuadradaRevisores =
  campoCalculadoMetragemQuadradaOperadores('revisores');

const campoCalculadoSegmento = {
  $addFields: {
    'detalhes.segmento': {
      $cond: [
        { $eq: ['$faca.codigo', 'Digital'] }, // condição Digital
        'Digital',
        {
          $cond: [
            {
              // condição Novo: producao.algo_novo é array com elementos
              $gt: [{ $size: { $ifNull: ['$producao.algo_novo', []] } }, 0],
            },
            'Novo',
            'Casa', // caso contrário
          ],
        },
      ],
    },
  },
};

const campoCalculadoTipoDeServico = {
  $addFields: {
    'detalhes.tipo_de_servico': {
      $cond: [
        { $lte: ['$producao.cores', 1] }, // se cores <= 1
        'P Fácil',
        {
          $cond: [
            { $eq: ['$producao.cores', 2] }, // se cores == 2
            'P Médio',
            'P Difícil', // se cores >= 3
          ],
        },
      ],
    },
  },
};

const camposCalculadosProducao = {
  $addFields: {
    'producao.total_m2': {
      $multiply: [
        { $toDouble: '$producao.metragem_linear' },
        { $divide: [{ $toDouble: '$producao.material.largura_mm' }, 1000] },
      ],
    },
    'producao.producao_m2': {
      $multiply: [
        { $toDouble: '$producao.unidades_produzidas' },
        {
          $divide: [
            { $toDouble: '$producao.metros_por_pacote' },
            { $toDouble: '$producao.quantidade_por_pacote' },
          ],
        },
        { $divide: [{ $toDouble: '$producao.material.largura_mm' }, 1000] },
        {
          // só divide por pistas_de_corte se segmento != "Digital"
          $cond: [
            { $ne: ['$detalhes.segmento', 'Digital'] },
            { $divide: [1, { $toDouble: '$producao.pistas_de_corte' }] },
            1, // se segmento == "Digital", multiplica por 1 (não altera)
          ],
        },
      ],
    },
  },
};

const camposCalculadosPerda = {
  $addFields: {
    'perda.m2': {
      $subtract: [
        { $toDouble: '$producao.total_m2' },
        { $toDouble: '$producao.producao_m2' },
      ],
    },
    'perda.porcentagem': {
      $divide: [
        {
          $subtract: [
            { $toDouble: '$producao.total_m2' },
            { $toDouble: '$producao.producao_m2' },
          ],
        },
        { $toDouble: '$producao.total_m2' },
      ],
    },
  },
};

function campoCalculadoMetragemQuadradaPerdidaOperadores(arrayName) {
  return [
    { $unwind: { path: `$${arrayName}`, preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        [`${arrayName}.perda_metragem_quadrada`]: {
          $cond: [
            {
              $and: [
                // 1️⃣ o arrayName existe (não é null / ausente)
                { $ne: [{ $ifNull: [`$${arrayName}`, null] }, null] },

                // 2️⃣ o campo perda_metragem_quadrada é nulo ou não existe
                {
                  $or: [
                    {
                      $eq: [
                        { $type: `$${arrayName}.perda_metragem_quadrada` },
                        'missing',
                      ],
                    },
                    { $eq: [`$${arrayName}.perda_metragem_quadrada`, null] },
                  ],
                },
              ],
            },
            // Então → faz o cálculo
            {
              $multiply: [
                { $toDouble: `$perda.m2` },
                {
                  $divide: [
                    { $toDouble: `$${arrayName}.metragem_quadrada` },
                    { $toDouble: '$producao.producao_m2' },
                  ],
                },
              ],
            },
            // Senão → mantém o valor atual (ou null, se não existir)
            `$${arrayName}.perda_metragem_quadrada`,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        [arrayName]: { $push: `$${arrayName}` },
        doc: { $first: '$$ROOT' },
      },
    },
    {
      $addFields: {
        [arrayName]: {
          $filter: {
            input: `$${arrayName}`,
            as: 'i',
            cond: { $gt: [{ $size: { $objectToArray: '$$i' } }, 0] },
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ['$doc', { [arrayName]: `$${arrayName}` }],
        },
      },
    },
  ];
}

const campoCalculadoMetragemQuadradaPerdidaImpressores =
  campoCalculadoMetragemQuadradaPerdidaOperadores('impressores');
const campoCalculadoMetragemQuadradaPerdidaCortadores =
  campoCalculadoMetragemQuadradaPerdidaOperadores('cortadores');

interface PedidosInputMapperConfig {
  primaryFilter?: boolean;
  lookupsCliente?: boolean;
  lookupsFaca?: boolean;
  lookupsMaterial?: boolean;
  lookupsMaquinaImpressores?: boolean;
  lookupsMaquinaCortadores?: boolean;
  lookupsMaquinaRevisores?: boolean;
  camposCalculadosDetalhes?: boolean;
  camposCalculadosProducao?: boolean;
  camposCalculadosPerda?: boolean;
  secondaryFilter?: boolean;
}

export function pedidosAggregationSteps(
  dto: PedidosFilterInputDTO = {},
  config?: PedidosInputMapperConfig,
): any[] {
  const aggregationSteps: any = [];

  aggregationSteps.push({ $sort: { codigo: -1 } });

  if (config?.primaryFilter !== false) {
    const primaryFilter = mapInputToPrimaryFilter(dto);

    if (Object.keys(primaryFilter).length) {
      aggregationSteps.push({
        $match: primaryFilter,
      });
    }
  }

  const lookups: any[] = [];

  const buscaClienteStep = {
    $match: {
      $or: [
        { 'cliente.codigo': { $regex: dto.busca_cliente, $options: 'i' } },
        {
          'cliente.nome_fantasia': {
            $regex: dto.busca_cliente,
            $options: 'i',
          },
        },
        {
          'cliente.razao_social': {
            $regex: dto.busca_cliente,
            $options: 'i',
          },
        },
      ],
    },
  };

  if (config?.lookupsCliente !== false) {
    lookups.push(...lookupsCliente);
  }

  if (config?.lookupsFaca !== false) {
    lookups.push(...lookupsFaca);
  }

  const buscaTipoMaterialStep = {
    $match: {
      'producao.material.materia_prima.tipo': { $in: dto.tipos_de_material },
    },
  };

  if (config?.lookupsMaterial !== false) {
    lookups.push(...lookupsMaterial);
  }

  if (config?.lookupsMaquinaImpressores !== false) {
    lookups.push(...lookupsMaquinaImpressores);
  }

  if (config?.lookupsMaquinaCortadores !== false) {
    lookups.push(...lookupsMaquinaCortadores);
  }

  if (config?.lookupsMaquinaRevisores !== false) {
    lookups.push(...lookupsMaquinaRevisores);
  }

  const camposCalculados: any[] = [];

  if (config?.camposCalculadosDetalhes !== false) {
    camposCalculados.push(campoCalculadoTipoDeServico);
  }

  if (config?.camposCalculadosDetalhes !== false) {
    camposCalculados.push(campoCalculadoSegmento);
  }

  if (config?.camposCalculadosProducao !== false) {
    camposCalculados.push(camposCalculadosProducao);
  }

  if (config?.camposCalculadosPerda !== false) {
    camposCalculados.push(camposCalculadosPerda);
  }

  camposCalculados.push(
    ...campoCalculadoMetragemQuadradaImpressores,
    ...campoCalculadoMetragemQuadradaCortadores,
    ...campoCalculadoMetragemQuadradaRevisores,
    ...campoCalculadoMetragemQuadradaPerdidaImpressores,
    ...campoCalculadoMetragemQuadradaPerdidaCortadores,
  );

  const secondaryFilter = mapInputToSecondaryFilter(dto);

  if (dto.limit && dto.page) {
    const { page, limit } = dto;

    const skip = (page - 1) * limit;

    if (dto.busca_cliente) {
      aggregationSteps.push(...lookupsCliente, buscaClienteStep);
    }

    if ((dto.tipos_de_material || []).filter((t) => !!t).length > 0) {
      aggregationSteps.push(...lookupsMaterial, buscaTipoMaterialStep);
    }

    if (dto.tipos_de_servico) {
      aggregationSteps.push(campoCalculadoTipoDeServico);

      aggregationSteps.push({
        $match: {
          'detalhes.tipo_de_servico':
            secondaryFilter['detalhes.tipo_de_servico'],
        },
      });

      delete secondaryFilter['detalhes.tipo_de_servico'];

      const index = camposCalculados.indexOf(campoCalculadoTipoDeServico);
      camposCalculados.splice(index, 1);
    }

    if (dto.segmentos) {
      aggregationSteps.push(campoCalculadoSegmento);

      aggregationSteps.push({
        $match: {
          'detalhes.segmento': secondaryFilter['detalhes.segmento'],
        },
      });

      delete secondaryFilter['detalhes.segmento'];

      const index = camposCalculados.indexOf(campoCalculadoSegmento);
      camposCalculados.splice(index, 1);
    }

    const itemsSteps: any = [
      { $skip: skip },
      { $limit: limit },
      ...lookups,
      ...camposCalculados,
    ];

    if (config?.secondaryFilter !== false) {
      if (Object.keys(secondaryFilter).length) {
        itemsSteps.push({
          $match: secondaryFilter,
        });
      }
    }

    itemsSteps.push({ $sort: { codigo: -1 } });

    aggregationSteps.push({
      $facet: {
        total: [{ $count: 'count' }],
        items: itemsSteps,
      },
    });
  } else {
    aggregationSteps.push(...lookups);

    if (dto.busca_cliente) {
      aggregationSteps.push(buscaClienteStep);
    }

    if ((dto.tipos_de_material || []).filter((t) => !!t).length > 0) {
      aggregationSteps.push(buscaTipoMaterialStep);
    }

    aggregationSteps.push(...camposCalculados);

    if (config?.secondaryFilter !== false) {
      if (Object.keys(secondaryFilter).length) {
        aggregationSteps.push({
          $match: secondaryFilter,
        });
      }
    }
  }

  return aggregationSteps;
}

function mapInputToPrimaryFilter(
  dto: PedidosFilterInputDTO,
): PedidosPrimaryFilterQuery {
  const filter: PedidosPrimaryFilterQuery = {};

  filter.$and = [];

  // String de busca
  if (dto.busca) {
    const busca = dto.busca.trim();
    if (busca.length > 0) {
      filter.$and.push({
        $or: [
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$codigo' }, // converte numero para string
                regex: busca,
                options: 'i',
              },
            },
          },
          { descricao: { $regex: busca, $options: 'i' } },
        ],
      });
    }
  }

  if (dto.busca_operador) {
    filter.$and.push({
      $or: [
        {
          'impressores.operador': { $regex: dto.busca_operador, $options: 'i' },
        },
        {
          'cortadores.operador': { $regex: dto.busca_operador, $options: 'i' },
        },
        { 'revisores.operador': { $regex: dto.busca_operador, $options: 'i' } },
      ],
    });
  }

  // Datas
  if (dto.startDate || dto.endDate) {
    filter['datas.finalizacao'] = {};

    if (dto.startDate) {
      const iniDate = DateTime.fromISO(dto.startDate, {
        zone: 'America/Fortaleza',
      }).toJSDate();
      filter['datas.finalizacao'].$gte = iniDate;
    }

    if (dto.endDate) {
      const fimDate = DateTime.fromISO(dto.endDate, {
        zone: 'America/Fortaleza',
      })
        .plus({ days: 1 }) // fim inclusivo
        .toJSDate();

      filter['datas.finalizacao'].$lt = fimDate;
    }
  }

  // Filtros
  if (dto.codigos?.length) {
    filter.codigo = { $in: dto.codigos };
  }
  if (dto.cliente_codigos?.length) {
    filter.cliente_codigo = { $in: dto.cliente_codigos };
  }
  if (dto.faca_codigos?.length) {
    filter['faca.codigo'] = { $in: dto.faca_codigos };
  }

  if (dto.desconsiderar_metragem !== undefined)
    filter['detalhes.desconsiderar_metragem'] = dto.desconsiderar_metragem;
  if (dto.amostra !== undefined) filter['detalhes.amostra'] = dto.amostra;
  if (dto.retrabalho !== undefined)
    filter['detalhes.retrabalho'] = dto.retrabalho;
  if (dto.acabamento_cold !== undefined)
    filter['detalhes.acabamento_cold'] = dto.acabamento_cold;

  if (dto.validado !== null && dto.validado !== undefined) {
    if (dto.validado === true) {
      filter['validado'] = true;
    } else {
      filter['$and'].push({
        $or: [{ validado: false }, { validado: { $exists: false } }]
      });
    }
  }

  if (filter.$and.length === 0) {
    delete filter.$and;
  }

  return filter;
}

function mapInputToSecondaryFilter(
  dto: PedidosFilterInputDTO,
): PedidosPrimaryFilterQuery {
  const filter: PedidosSecondaryFilterQuery = {};

  // Filtros
  if (dto.segmentos) {
    filter['detalhes.segmento'] = { $in: dto.segmentos };
  }

  if (dto.tipos_de_servico) {
    filter['detalhes.tipos_de_servico'] = { $in: dto.tipos_de_servico };
  }

  return filter;
}
