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
import { ClientesService } from './clientes.service';
import { ClientesFilterInputDTO } from './dto/clientes-filter-input.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly svc: ClientesService) {}

  //   @UseGuards(JwtAuthGuard)
  //   @ApiBearerAuth()
  //   @Post()
  //   create(@Body() body: any) {
  //     return this.svc.create(body);
  //   }

  //   @UseGuards(JwtAuthGuard)
  //   @ApiBearerAuth()
  //   @Post()
  // @Get()
  // findAll() { return this.svc.findAll(); }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo', ParseIntPipe) codigo: number) {
    return this.svc.findByCodigo(codigo);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('paginated')
  findPaged(@Query() q: ClientesFilterInputDTO) {
    return this.svc.findPaged(q);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('id/:id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.svc.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('lista')
  getList(@Query() q: ClientesFilterInputDTO) {
    return this.svc.getList(q);
  }

//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth()
//   @Patch(':id')
//   update(@Param('id', ParseObjectIdPipe) id: string, @Body() body: any) {
//     return this.svc.update(id, body);
//   }

//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth()
//   @Delete(':id')
//   remove(@Param('id', ParseObjectIdPipe) id: string) {
//     return this.svc.remove(id);
//   }
}
