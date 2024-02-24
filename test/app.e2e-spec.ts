import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

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

  it('returns correct data when querying BTC', async () => {
    expect(app.get(ConfigService).get('allowed-client-keys')).toBe(clientKey);
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('method', 'v1/cryptocurrency/quotes/latest');
    urlSearchParams.set('symbol', 'BTC');
    urlSearchParams.set('convert', 'USD');
    const response = await request(app.getHttpServer())
      .get(`/query?${urlSearchParams}`)
      .set('X-CLIENT-KEY', clientKey)
      .expect(200)
      .expect('Content-Type', /json/);
    expect(response.body).toMatchObject({
      statusCode: 200,
      response: {
        status: { error_code: 0 },
        data: { "BTC": {} }
      },
    });
  });

  it('returns 400 if no method specified', async () => {
    await request(app.getHttpServer())
      .get(`/query`)
      .set('X-CLIENT-KEY', clientKey)
      .expect(400)
      .expect({
        "statusCode": 400,
        "message": 'API method not specified'
      });
  });

  it('returns 403 if no client key', async () => {
    await request(app.getHttpServer())
      .get(`/query`)
      .expect(403)
      .expect({
        "statusCode": 403,
        "message": 'Forbidden: invalid client key'
      });
  });

  it('returns 403 if wrong client key', async () => {
    await request(app.getHttpServer())
      .get(`/query`)
      .set('X-CLIENT-KEY', 'invalid-key')
      .expect(403)
      .expect({
        "statusCode": 403,
        "message": 'Forbidden: invalid client key'
      });
  });
});
