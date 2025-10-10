import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import { PedidosFilterInputDTO } from './dto/pedidos-filter-input.dto';
import { PedidosService } from './pedidos.service';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';

@Controller('pedidos')
export class PedidosController {
    constructor(private readonly svc: PedidosService) { }

    @Post()
    create(@Body() body: any) { return this.svc.create(body); }

    // @Get()
    // findAll() { return this.svc.findAll(); }

    @Get('codigo/:codigo')
    findByCodigo(@Param('codigo', ParseIntPipe) codigo: number) {
        return this.svc.findByCodigo(codigo);
    }

    @Get('paginated')
    findPaged(@Query() q: PedidosFilterInputDTO ) {
        return this.svc.findPaged(q);
    }

    @Get('metrics')
    metrics(@Query() q: PedidosFilterInputDTO ) {
        q.validado = true;
        return this.svc.metrics(q);
    }

    @Get('id/:id')
    findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.svc.findById(id);
    }

    @Patch(':id')
    update(@Param('id', ParseObjectIdPipe) id: string, @Body() body: any) {
        return this.svc.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id', ParseObjectIdPipe) id: string) {
        return this.svc.remove(id);
    }
}
