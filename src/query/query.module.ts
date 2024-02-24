import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { QueryService } from './query.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [QueryController],
  providers: [QueryService],
})
export class QueryModule { }
