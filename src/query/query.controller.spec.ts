import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { from } from 'rxjs';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { QuotesResponse } from '../data/QuotesResponse';
import { CmcQuotesResponse } from '../data/CmcQuotesResponse';

describe('QueryController', () => {
  const testHost = 'test.com';
  const testApiMethod = 'v2/cryptocurrency/quotes/latest';
  const testApiParameters = 'symbol=BTC%2CETH&convert=USD';
  const testUrl = `https://${testHost}/${testApiMethod}?${testApiParameters}`;
  const testCmcKey = '123';
  const testClientKey = 'test-key';

  const testBtcPrice = 10000;
  const testBtcChange1h = 100;
  const testBtcChange24h = 200;
  const testEthPrice = 2000;
  const testEthChange1h = 300;
  const testEthChange24h = 400;
  const testCmcResponse: CmcQuotesResponse = {
    status: {
      error_code: 0,
    },
    data: {
      "BTC": [{
        symbol: "BTC",
        quote: {
          USD: {
            price: testBtcPrice,
            percent_change_1h: testBtcChange1h * 100,
            percent_change_24h: testBtcChange24h * 100,
          }
        }
      }],
      "ETH": {
        symbol: "ETH",
        quote: {
          USD: {
            price: testEthPrice,
            percent_change_1h: testEthChange1h * 100,
            percent_change_24h: testEthChange24h * 100,
          }
        }
      },
    },
  };

  let controller: QueryController;
  const mockHttpServiceProvider = () => ({
    get: jest.fn((_url: string, _options: Record<string, any>) => {
      return from([{ data: testCmcResponse }]);
    }),
  });
  let mockHttpService: ReturnType<typeof mockHttpServiceProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        ignoreEnvFile: true,
        ignoreEnvVars: true,
        load: [
          () => ({
            'cmc-api-key': testCmcKey,
            'cmc-host': testHost,
            'allowed-client-keys': testClientKey,
          })
        ],
      })],
      controllers: [QueryController],
      providers: [QueryService, HttpService],
    })
      .overrideProvider(HttpService)
      .useValue(mockHttpServiceProvider())
      .compile();

    controller = module.get<QueryController>(QueryController);
    mockHttpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw HttpException 400 if no symbols specified', async () => {
    expect.assertions(3);
    return controller.getQuotes('')
      .catch(error => {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(400);
        expect(mockHttpService.get).not.toHaveBeenCalled();
      });
  });

  it('should return response from upstream', async () => {
    const response = await controller.getQuotes('BTC,ETH');
    const expectedQuotesResponse: QuotesResponse = {
      statusCode: 200,
      data: {
        quotes: [
          {
            status: 'ok',
            ticker: 'BTC',
            price: testBtcPrice,
            change1h: testBtcChange1h,
            change24h: testBtcChange24h,
          },
          {
            status: 'ok',
            ticker: 'ETH',
            price: testEthPrice,
            change1h: testEthChange1h,
            change24h: testEthChange24h,
          },
        ]
      }
    }
    expect(response).toMatchObject(expectedQuotesResponse);
    expect(mockHttpService.get).toHaveBeenCalledTimes(1);
    const lastCall = mockHttpService.get.mock.lastCall!;
    expect(lastCall[0]).toBe(testUrl);
    expect(lastCall[1]).toMatchObject({
      headers: {
        'X-CMC_PRO_API_KEY': testCmcKey,
      }
    });
  });
});
