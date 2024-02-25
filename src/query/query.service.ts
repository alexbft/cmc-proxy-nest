import { HttpService } from "@nestjs/axios";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { URL } from "url";
import { firstValueFrom } from "rxjs";
import { QuotesResponse } from "../data/QuotesResponse";
import { CmcQuotesResponse } from "../data/CmcQuotesResponse";
import { Quote } from "../data/Quote";

@Injectable()
export class QueryService {
  private readonly cmcKey: string;
  private readonly cmcHost: string;
  private readonly logger = new Logger("QueryService");

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService) {
    this.cmcHost = configService.getOrThrow('cmc-host');
    this.cmcKey = configService.getOrThrow('cmc-api-key');
  }

  private async sendCmcQuery(apiMethod: string, query: string): Promise<object> {
    this.logger.log(`Handling method: ${apiMethod} with query: ${query}`);
    const url = new URL(`https://${this.cmcHost}`);
    url.pathname = apiMethod;
    url.search = query;
    const responseObs = this.httpService.get<object>(url.toString(), {
      responseType: 'json',
      headers: {
        'X-CMC_PRO_API_KEY': this.cmcKey,
      },
      validateStatus: status => status === 200 || status === 400,
    });
    try {
      const response = await firstValueFrom(responseObs);
      return response.data;
    } catch (e: any) {
      if (e.response != null) {
        this.logger.error(`CMC returned error code: ${e.response.status}. Response: ${JSON.stringify(e.response.data)}`);
      }
      throw e;
    }
  }

  async getQuotes(tickers: string[]): Promise<QuotesResponse> {
    const params = new URLSearchParams();
    params.set('symbol', tickers.join(','));
    params.set('convert', 'USD');
    const cmcResponse = await this.sendCmcQuery('v2/cryptocurrency/quotes/latest', params.toString()) as CmcQuotesResponse;
    if (cmcResponse.status.error_code !== 0) {
      return {
        statusCode: cmcResponse.status.error_code,
        message: cmcResponse.status.error_message
      };
    }
    const quotes = tickers.map<Quote>(ticker => {
      const currencyData = cmcResponse.data![ticker];
      const currencyDataSingle = Array.isArray(currencyData) ? currencyData[0] : currencyData;
      if (currencyData == null) {
        return {
          status: 'not_found',
          ticker: ticker,
        };
      }
      const cmcQuote = currencyDataSingle.quote.USD;
      return {
        status: 'ok',
        ticker: currencyDataSingle.symbol,
        price: cmcQuote.price,
        change1h: cmcQuote.percent_change_1h * 0.01,
        change24h: cmcQuote.percent_change_24h * 0.01,
      };
    });
    return {
      statusCode: HttpStatus.OK,
      data: { quotes },
    };
  }
}
