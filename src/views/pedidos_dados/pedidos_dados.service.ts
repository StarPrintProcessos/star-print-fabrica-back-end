import { DateTime } from 'luxon';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PedidosFilterInputDTO } from './dto/pedidos-filter-input.dto';
import {
  PaginatedPedidosDadosDTO,
  PedidoDadosDatabaseDTO,
} from './dto/pedidos_dados-database.dto';

@Injectable()
export class PedidosDadosService {
  constructor(private prisma: PrismaService) {}

  async findPaginated(
    dto: PedidosFilterInputDTO,
  ): Promise<PaginatedPedidosDadosDTO> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const skip = (page - 1) * limit;
    const take = limit;

    // --------------------------------------------------
    // 1) WHERE dinâmico
    // --------------------------------------------------
    const where: Prisma.pedidos_dadosWhereInput = {};

    // 🔍 Busca genérica (cliente, faca, operador, texto, etc)
    if (dto.busca) {
      where.OR = [
        { cliente_nome_fantasia: { contains: dto.busca, mode: 'insensitive' } },
        { cliente_razao_social: { contains: dto.busca, mode: 'insensitive' } },
        { codigo_pedido: Number(dto.busca) || -99999999 },
      ];
    }

    // 🔍 Busca específica por cliente
    if (dto.busca_cliente) {
      where.OR = [
        {
          cliente_nome_fantasia: {
            contains: dto.busca_cliente,
            mode: 'insensitive',
          },
        },
        {
          cliente_razao_social: {
            contains: dto.busca_cliente,
            mode: 'insensitive',
          },
        },
      ];
    }

    // 🔍 Busca por operador (vem da coluna JSON "operacoes")
    if (dto.busca_operador) {
      where.operacoes = {
        path: ['operador_nome'],
        string_contains: dto.busca_operador,
      } as any;
    }

    // 🔍 Range de datas
    if (dto.startDate || dto.endDate) {
      where.data_finalizacao = {};

      // --- START DATE ---
      if (dto.startDate) {
        // 00:00:00 no fuso brasileiro
        const start = DateTime.fromISO(dto.startDate, {
          zone: 'America/Sao_Paulo',
        })
          .startOf('day')
          .toUTC(); // converte para UTC (Prisma sempre usa UTC)

        where.data_finalizacao.gte = start.toJSDate();
      }

      // --- END DATE ---
      if (dto.endDate) {
        // 23:59:59.999 no fuso brasileiro
        const end = DateTime.fromISO(dto.endDate, { zone: 'America/Sao_Paulo' })
          .endOf('day')
          .toUTC();

        where.data_finalizacao.lte = end.toJSDate();
      }

      // --- SE NÃO TIVER endDate, MAS TIVER startDate ---
      if (dto.startDate && !dto.endDate) {
        const end = DateTime.fromISO(dto.startDate, {
          zone: 'America/Sao_Paulo',
        })
          .endOf('day')
          .toUTC();

        where.data_finalizacao.lte = end.toJSDate();
      }
    }

    // 🔢 Lista de códigos
    if (dto.codigos?.length) {
      where.codigo_pedido = { in: dto.codigos };
    }

    // 🔢 Código de cliente
    if (dto.cliente_codigos?.length) {
      where.cliente_codigo = { in: dto.cliente_codigos };
    }

    // 🔠 Código de faca
    if (dto.faca_codigos?.length) {
      where.codigo_faca = { in: dto.faca_codigos };
    }

    // 🔢 Filtros booleanos
    if (dto.desconsiderar_metragem !== undefined) {
      where.desconsiderar_metragem = dto.desconsiderar_metragem;
    }
    if (dto.amostra !== undefined) {
      where.eh_amostra = dto.amostra;
    }
    if (dto.retrabalho !== undefined) {
      where.retrabalho = dto.retrabalho;
    }
    if (dto.acabamento_cold !== undefined) {
      where.acabamento_cold = dto.acabamento_cold;
    }

    // 🔠 Filtros múltiplos
    if (dto.tipos_de_servico?.length) {
      where.tipo_faca = { in: dto.tipos_de_servico };
    }

    if (dto.tipos_de_material?.length) {
      where.tipo_materia_prima = { in: dto.tipos_de_material };
    }

    if (dto.segmentos?.length) {
      where.segmento = { in: dto.segmentos };
    }

    if (dto.validado !== undefined) {
      where.validado = dto.validado;
    }

    // --------------------------------------------------
    // 2) Execução da consulta paginada
    // --------------------------------------------------
    const [items, total] = await this.prisma.$transaction([
      this.prisma.pedidos_dados.findMany({
        where,
        skip,
        take,
        orderBy: { data_finalizacao: 'desc' },
      }),
      this.prisma.pedidos_dados.count({ where }),
    ]);

    // --------------------------------------------------
    // 3) Formato de retorno padrão
    // --------------------------------------------------
    return {
      page,
      limit,
      total,
      items,
    };
  }

  async findByCodigo(codigo: number): Promise<PedidoDadosDatabaseDTO> {
    const pedido = await this.prisma.pedidos_dados.findFirst({
      where: { codigo_pedido: codigo },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${codigo} não encontrado.`);
    }

    return pedido;
  }
}
