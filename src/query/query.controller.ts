import { Controller, Get, Query, Request } from '@nestjs/common';
import { QueryService } from './query.service';
import { Request as ExpressRequest } from 'express';

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) { }

  @Get()
  getQuery(@Request() req: ExpressRequest): Promise<object> {
    const url = new URL(req.url, 'https://example.com');
    return this.queryService.sendCmcQuery(url.pathname, url.search);
  }
}
