import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { from } from 'rxjs';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';

describe('QueryController', () => {
  const testHost = 'test.com';
  const testApiMethod = 'testMethod/1/2';
  const testApiParameters = 'foo=bar&qux=some';
  const testUrl = `https://${testHost}/${testApiMethod}?${testApiParameters}`;
  const testCmcKey = '123';
  const testCmcResponse = { someKey: 'some value' };
  const testClientKey = 'test-key';

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

  it('should throw HttpException 400 if no method specified', async () => {
    expect.assertions(3);
    return controller.getQuery({ url: `/query?${testApiParameters}` } as any)
      .catch(error => {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(400);
        expect(mockHttpService.get).not.toHaveBeenCalled();
      });
  });

  it('should return response from upstream', async () => {
    const apiMethod = testApiMethod;
    const apiParameters = testApiParameters;
    const response = await controller.getQuery({ url: `/query?method=${apiMethod}&${apiParameters}` } as any);
    expect(response).toMatchObject({
      statusCode: 200,
      response: testCmcResponse
    });
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
