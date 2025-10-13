import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientesModule } from './collections/clientes/clientes.module';
import { PedidosModule } from './collections/pedidos/pedidos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGO_URI'),
        serverSelectionTimeoutMS: 5000,
        directConnection: true,
      }),
    }),
    PedidosModule,
    ClientesModule
  ],
})
export class AppModule {}
