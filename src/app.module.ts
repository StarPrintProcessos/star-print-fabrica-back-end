import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './collections/users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './collections/clientes/clientes.module';
import { PedidosModule } from './collections/pedidos/pedidos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGO_URI'),
        dbName: cfg.get<string>('MONGO_DB'),
        serverSelectionTimeoutMS: 5000,
        directConnection: true,
      }),
    }),
    PedidosModule,
    ClientesModule,
    UsersModule,
    AuthModule
  ],
})
export class AppModule {}
