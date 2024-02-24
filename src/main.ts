import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, NestApplicationOptions } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

async function bootstrap() {
  const certDir = path.resolve(__dirname, '../cert');
  const options: NestApplicationOptions = {};
  if (existsSync(certDir)) {
    const httpsOptions = {
      key: readFileSync(path.resolve(certDir, 'key.pem')),
      cert: readFileSync(path.resolve(certDir, 'cert.pem')),
    };
    options.httpsOptions = httpsOptions;
  } else {
    Logger.warn(`Not using HTTPS! To fix, provide cert/key.pem and cert/cert.pem.`, 'bootstrap');
  }
  const app = await NestFactory.create(AppModule, options);
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow('port') as number;
  Logger.log(`Listening on port ${port}`, 'bootstrap');
  await app.listen(port);
}
bootstrap();
