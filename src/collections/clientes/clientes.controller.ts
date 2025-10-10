import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import { ClientesFilterInputDTO } from './dto/clientes-filter-input.dto';
import { ClientesService } from './clientes.service';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';

@Controller('clientes')
export class ClientesController {
    constructor(private readonly svc: ClientesService) { }

    @Post()
    create(@Body() body: any) { return this.svc.create(body); }

    // @Get()
    // findAll() { return this.svc.findAll(); }

    @Get('codigo/:codigo')
    findByCodigo(@Param('codigo', ParseIntPipe) codigo: number) {
        return this.svc.findByCodigo(codigo);
    }

    @Get('paginated')
    findPaged(@Query() q: ClientesFilterInputDTO ) {
        return this.svc.findPaged(q);
    }

    @Get('id/:id')
    findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.svc.findById(id);
    }

    @Get('lista')
    getList(@Query() q: ClientesFilterInputDTO) {
        return this.svc.getList(q);
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
