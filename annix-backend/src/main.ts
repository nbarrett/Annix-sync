import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Enable global validation (checks DTOs automatically)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // remove unknown properties
        forbidNonWhitelisted: true, // throw error if extra fields
        transform: true, // auto-transform payloads to DTO instances
      }),
    );
  
    // swagger configuration
    const config = new DocumentBuilder()
    .setTitle('Annix API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth() // optional, if using JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
