import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

// Requires a reachable Postgres in DATABASE_URL, plus API_KEYS and ENCRYPTION_KEY.
const KEY = process.env.API_KEYS!.split(',')[0];

describe('Authkeep API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /health is public', () =>
    request(app.getHttpServer()).get('/health').expect(200).expect((r) => expect(r.body.status).toBe('ok')));

  it('rejects requests without a valid API key', async () => {
    await request(app.getHttpServer()).get('/totp/codes').expect(401);
    await request(app.getHttpServer()).get('/totp/codes').set('x-api-key', 'wrong').expect(401);
  });

  it('adds accounts and returns live codes', async () => {
    const server = app.getHttpServer();
    const fromUri = await request(server)
      .post('/totp/accounts')
      .set('x-api-key', KEY)
      .send({ uri: 'otpauth://totp/GitHub:me%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub' })
      .expect(201);
    expect(fromUri.body).toMatchObject({ label: 'me@example.com', issuer: 'GitHub' });
    expect(fromUri.body.secretEnc).toBeUndefined();

    await request(server)
      .post('/totp/accounts')
      .set('authorization', `Bearer ${KEY}`)
      .send({ label: 'aws', secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', digits: 8 })
      .expect(201);

    await request(server).post('/totp/accounts').set('x-api-key', KEY).send({ label: 'bad', secret: '!!!' }).expect(400);

    const list = await request(server).get('/totp/accounts').set('x-api-key', KEY).expect(200);
    expect(list.body.every((a: Record<string, unknown>) => !('secretEnc' in a))).toBe(true);

    const codes = await request(server).get('/totp/codes').set('x-api-key', KEY).expect(200);
    const aws = codes.body.find((c: { label: string }) => c.label === 'aws');
    expect(aws.code).toMatch(/^\d{8}$/);
    expect(aws.remainingSeconds).toBeGreaterThan(0);

    const one = await request(server).get(`/totp/codes/${fromUri.body.id}`).set('x-api-key', KEY).expect(200);
    expect(one.body.code).toMatch(/^\d{6}$/);

    await request(server).delete(`/totp/accounts/${fromUri.body.id}`).set('x-api-key', KEY).expect(204);
    await request(server).get(`/totp/codes/${fromUri.body.id}`).set('x-api-key', KEY).expect(404);
  });
});
