import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './collections/users/users.module';
import { AuthModule } from './auth/auth.module';
// import { ClientesModule } from './collections/clientes/clientes.module';
// import { PedidosModule } from './collections/pedidos/pedidos.module';
import { PrismaModule } from './prisma/prisma.module';
import { PedidosDadosModule } from './views/pedidos_dados/pedidos_dados.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // ClientesModule,
    // PedidosModule,
    PedidosDadosModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}

