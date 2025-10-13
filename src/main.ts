import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (process.env.NODE_ENV === 'production') {
    // Habilita CORS apenas para a URL do front-end
    app.enableCors({
      origin: process.env.FRONT_END_URL,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true, // se precisar enviar cookies
    });
  } else {
    // Habilita CORS para qualquer URL
    app.enableCors();
  }

  await app.listen(process.env.BACK_END_PORT ?? 3000);
}
bootstrap();
