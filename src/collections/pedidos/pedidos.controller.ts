import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { PedidosFilterInputDTO } from './dto/pedidos-filter-input.dto';
import { PedidosService } from './pedidos.service';
import { formatPedido, Pedido } from './schemas/pedidos.schema';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly svc: PedidosService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() body: Partial<Pedido>): Promise<Pedido> {
    body = formatPedido(body);
    return this.svc.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async patch(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() body: Partial<Pedido>): Promise<Pedido> {
    body = formatPedido(body);

    return this.svc.patch(id, body);
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
    return this.svc.findPaged(q);
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
