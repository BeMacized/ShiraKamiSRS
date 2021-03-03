import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { buildVersion } from './assets/build-version.json';
import * as helmet from 'helmet';

async function bootstrap() {
  console.log(`Starting ShiraKamiSRS v${buildVersion}`);
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
