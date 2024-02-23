import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [QueryController],
  providers: [],
})
export class QueryModule { }
