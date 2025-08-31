import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SeedRunner } from './database/seeds/run-seed';
import { ValidationPipe } from '@nestjs/common';
dotenv.config({ path: '.env' });




async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,     // Strips properties that are not defined in the DTO
    // forbidNonWhitelisted: true,  // Throws an error when extra properties are passed
    transform: true,      // Automatically transforms payloads to DTO instances
  }));

  const dataSource = app.get(DataSource); // Get the DataSource

  const seedRunner = new SeedRunner(); // Create an instance of SeedRunner
  await seedRunner.run(dataSource); // Run the seeders

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Dating App API')
    .setDescription('API documentation for the Dating App')
    .setVersion('1.0')
    .addBearerAuth({
      description: `Please enter token`,
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header'
    },
      'access-token',)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.APP_PORT || 4003);
}
bootstrap();
