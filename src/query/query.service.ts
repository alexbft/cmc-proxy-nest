import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { URL } from "url";
import { firstValueFrom } from "rxjs";

@Injectable()
export class QueryService {
  private readonly cmcKey: string;
  private readonly cmcHost: string;

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService) {
    this.cmcHost = configService.getOrThrow('cmc-host');
    this.cmcKey = configService.getOrThrow('cmc-api-key');
  }

  async sendCmcQuery(apiMethod: string, query: string): Promise<object> {
    const url = new URL(`https://${this.cmcHost}`);
    url.pathname = apiMethod;
    url.search = query;
    const responseObs = this.httpService.get<object>(url.toString(), {
      headers: {
        'X-CMC_PRO_API_KEY': this.cmcKey,
      },
    });
    const response = await firstValueFrom(responseObs);
    return response.data;
  }
}
