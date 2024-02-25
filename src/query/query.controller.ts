import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { QuotesResponse } from '../data/QuotesResponse';
import { ClientKeyGuard } from '../guard/client_key.guard';
import { QueryService } from './query.service';

@Controller()
@UseGuards(ClientKeyGuard)
export class QueryController {
  constructor(private readonly queryService: QueryService) { }

  @Get('quotes')
  async getQuotes(@Query('symbol') symbols: string): Promise<QuotesResponse> {
    if (symbols == null || symbols === '') {
      throw new HttpException('No symbols specified', HttpStatus.BAD_REQUEST);
    }
    return this.queryService.getQuotes(symbols.split(','));
  }
}
