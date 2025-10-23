import { it, expect, beforeAll, describe } from '@jest/globals';
import request from 'supertest';
import appFactory from '../testutils/appFactory';

let app: any;

beforeAll(async () => {
  app = await appFactory();
});

describe('Auth E2E Tests', () => {
  it('register -> login -> me', async () => {
      const email = `test${Date.now()}@example.com`;
      const password = 'password123';

    const reg = await request(app).post('/api/auth/register').send({ email, password });
    expect(reg.status).toBe(201);
    expect(reg.body.accessToken).toBeDefined();

    const login = await request(app).post('/api/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    const access = login.body.accessToken;
    expect(access).toBeDefined();

    const me = await request(app).get('/api/auth/user/me').set('Authorization', `Bearer ${access}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);
  });
});