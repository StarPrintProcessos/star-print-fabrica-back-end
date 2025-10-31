import {
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { PedidosFilterInputDTO } from './dto/pedidos-filter-input.dto';
import { PedidosService } from './pedidos.service';
import { formatPedido, Pedido } from './schemas/pedidos.schema';

type CreateFlowResult = {
  action: 'created' | 'replaced' | 'ignored';
  pedido: Pedido;
};

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly svc: PedidosService) {}


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() body: Pedido): Promise<CreateFlowResult> {
    const formatted = formatPedido(body);
    return this.svc.createOrReplaceByCodigo(formatted);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async patch(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: Partial<Pedido>,
  ): Promise<Pedido> {
    body = formatPedido(body);

    try {
      return await this.svc.patch(id, body);
    } catch (err: any) {
      if (err?.code === 11000 && err.keyPattern?.codigo) {
        // conflito de duplicidade no campo "codigo"
        throw new ConflictException({
          message: 'Já existe um pedido com este código.',
          field: 'codigo',
          duplicatedValue: err.keyValue?.codigo,
        });
      }

      throw new InternalServerErrorException('Erro ao atualizar o pedido.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo', ParseIntPipe) codigo: number) {
    return this.svc.findByCodigo(codigo);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('paginated')
  findPaged(@Query() q: PedidosFilterInputDTO) {
    const res = this.svc.findPaged(q);
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('metrics')
  metrics(@Query() q: PedidosFilterInputDTO) {
    q.validado = true;
    return this.svc.metrics(q);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('id/:id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.svc.findById(id);
  }

  //   @UseGuards(JwtAuthGuard)
  //   @ApiBearerAuth()
  //   @Delete(':id')
  //   remove(@Param('id', ParseObjectIdPipe) id: string) {
  //     return this.svc.remove(id);
  //   }
}
