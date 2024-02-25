import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { QuotesResponse } from 'src/src/data/QuotesResponse';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  let clientKey = 'test-key';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test
      .createTestingModule({
        imports: [AppModule],
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('returns correct data when querying BTC and ETH', async () => {
    expect(app.get(ConfigService).get('allowed-client-keys')).toBe(clientKey);
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('symbol', 'BTC,ETH');
    const response = await request(app.getHttpServer())
      .get(`/quotes?${urlSearchParams}`)
      .set('X-CLIENT-KEY', clientKey)
      .expect(200)
      .expect('Content-Type', /json/);
    const expectedResponse: QuotesResponse = {
      statusCode: 200,
      data: {
        quotes: expect.arrayContaining([
          expect.objectContaining({
            status: 'ok',
            ticker: 'BTC',
          }),
          expect.objectContaining({
            status: 'ok',
            ticker: 'ETH',
          }),
        ])
      }
    }
    expect(response.body).toMatchObject(expectedResponse);
  });

  it('returns 400 if no symbols specified', async () => {
    await request(app.getHttpServer())
      .get(`/quotes`)
      .set('X-CLIENT-KEY', clientKey)
      .expect(400)
      .expect({
        "statusCode": 400,
        "message": 'No symbols specified'
      });
  });

  it('returns 403 if no client key', async () => {
    await request(app.getHttpServer())
      .get(`/quotes`)
      .expect(403)
      .expect({
        "statusCode": 403,
        "message": 'Forbidden: invalid client key'
      });
  });

  it('returns 403 if wrong client key', async () => {
    await request(app.getHttpServer())
      .get(`/quotes`)
      .set('X-CLIENT-KEY', 'invalid-key')
      .expect(403)
      .expect({
        "statusCode": 403,
        "message": 'Forbidden: invalid client key'
      });
  });
});
