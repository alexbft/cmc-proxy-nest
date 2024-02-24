import { Controller, Get, HttpException, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { QueryService } from './query.service';
import { ClientKeyGuard } from '../guard/client_key.guard';

@Controller('query')
@UseGuards(ClientKeyGuard)
export class QueryController {
  constructor(private readonly queryService: QueryService) { }

  @Get()
  async getQuery(@Request() req: ExpressRequest): Promise<object> {
    const url = new URL(req.url, 'https://example.com');
    const apiMethod = url.searchParams.get('method');
    if (apiMethod == null) {
      throw new HttpException('API method not specified', HttpStatus.BAD_REQUEST);
    }
    url.searchParams.delete('method');
    const cmcResponse = await this.queryService.sendCmcQuery(apiMethod, url.searchParams.toString());
    return {
      statusCode: HttpStatus.OK,
      response: cmcResponse,
    };
  }
}
