import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuração do Swagger para documentação da API
  const config = new DocumentBuilder()
    .setTitle('Star Print API')
    .setDescription('API para o sistema da Star Print')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  if (process.env.NODE_ENV === 'production') {
    // Habilita CORS para o frontend e para o acesso via navegador
    app.enableCors({
      origin: [process.env.FRONT_END_URL, 'https://backapp.starprintonline.com'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true, // se precisar enviar cookies
    });
  } else {
    // Habilita CORS para qualquer URL
    app.enableCors();
  }

  // Em produção, escuta em todas as interfaces (0.0.0.0)
  // Isso é crucial para contêineres Docker
  const configService = app.get(ConfigService);
  const port = configService.get('BACK_END_PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Aplicação rodando na porta ${port}`);
  // console.log(`Documentação Swagger disponível em: http://localhost:${port}/api`);
}
bootstrap();
