import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { buildVersion } from './assets/build-version.json';
import * as helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  console.log(`Starting ShiraKamiSRS v${buildVersion}`);
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  if ((app.get('ConfigService') as ConfigService).get<boolean>('ENABLE_CORS'))
    app.enableCors();
  await app.listen(3000);
}
bootstrap();
