import { Module } from '@nestjs/common';
import { PedidosDadosService } from './pedidos_dados.service';
import { PedidosDadosController } from './pedidos_dados.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PedidosDadosController],
  providers: [PedidosDadosService, PrismaService],
})
export class PedidosDadosModule {}
