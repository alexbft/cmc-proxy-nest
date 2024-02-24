import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import path from 'path';
import { QueryModule } from './query/query.module';

const configFileName = process.env['NODE_ENV'] === 'test' ? '.testing.env' : '.default.env';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(__dirname, `env/${configFileName}`),
    }),
    QueryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
