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

  // Em produção, escuta em todas as interfaces (0.0.0.0)
  // Isso é crucial para contêineres Docker
  const port = process.env.BACK_END_PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Aplicação rodando na porta ${port}`);
}
bootstrap();
