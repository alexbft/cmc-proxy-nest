import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import path from 'path';
import { QueryModule } from './query/query.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(__dirname, 'env/.default.env'),
    }),
    QueryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
