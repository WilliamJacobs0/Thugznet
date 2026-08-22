import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Thugzcation (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/thugzcation (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/thugzcation')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          thugzcation: { year: 2026, selectedThugzMansion: null },
          thugz: [{ name: 'Willie Steel' }, { name: 'Jake Jarkin' }],
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
