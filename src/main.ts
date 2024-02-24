import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import path from 'path';

async function bootstrap() {
  const certDir = path.resolve(__dirname, '../cert');
  const httpsOptions = {
    key: readFileSync(path.resolve(certDir, 'key.pem')),
    cert: readFileSync(path.resolve(certDir, 'cert.pem')),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow('port') as number;
  Logger.log(`Listening on port ${port}`);
  await app.listen(port);
}
bootstrap();
