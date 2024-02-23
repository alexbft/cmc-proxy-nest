import { HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { from } from 'rxjs';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';

describe('QueryController', () => {
  const testHost = 'test.com';
  const testPath = '/testMethod/1/2';
  const testSearch = '?foo=bar';
  const testUrl = `https://${testHost}${testPath}${testSearch}`;
  const testCmcKey = '123';
  const testCmcResponse = { 'yoba': 'allou' };

  let controller: QueryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        ignoreEnvFile: true,
        ignoreEnvVars: true,
        load: [
          () => ({
            'cmc-api-key': testCmcKey,
            'cmc-host': testHost,
          })
        ],
      })],
      controllers: [QueryController],
      providers: [QueryService, HttpService],
    })
      .overrideProvider(HttpService)
      .useValue({
        get(url: string, options: any) {
          expect(url).toBe(testUrl);
          expect(options.headers).toMatchObject({ 'X-CMC_PRO_API_KEY': testCmcKey });
          return from([{ data: testCmcResponse }]);
        }
      })
      .compile();

    controller = module.get<QueryController>(QueryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return response from upstream', async () => {
    const apiMethod = testPath;
    const query = testSearch;
    const response = await controller.getQuery({ url: `${apiMethod}${query}` } as any);
    expect(response).toMatchObject(testCmcResponse);
  });
});
