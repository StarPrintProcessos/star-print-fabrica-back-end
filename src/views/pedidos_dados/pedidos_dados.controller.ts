import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PedidosDadosService } from './pedidos_dados.service';
import { PedidosFilterInputDTO } from './dto/pedidos-filter-input.dto';
import { mapPedidosDadosToOutput } from './utils/pedidos_dados-output-mapper';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('pedidosDados')
export class PedidosDadosController {
  constructor(private service: PedidosDadosService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('paginated')
  async findPaginated(@Query() dto: PedidosFilterInputDTO) {
    const fetchedObj = await this.service.findPaginated(dto);

    const returnObj = {
      ...fetchedObj,
      items: fetchedObj.items.map(mapPedidosDadosToOutput),
    };

    return returnObj;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('codigo/:codigo')
  async findByCodigo(@Param('codigo', ParseIntPipe) codigo: number) {
    const fetchedObj = await this.service.findByCodigo(codigo);

    return fetchedObj;

    const returnObj = mapPedidosDadosToOutput(fetchedObj);
    return returnObj;
  }
}
