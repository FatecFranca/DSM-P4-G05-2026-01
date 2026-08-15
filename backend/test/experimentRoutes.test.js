import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mocks = vi.hoisted(() => ({
  experimentEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(function MockPrisma() {
    return { experimentEvent: mocks.experimentEvent };
  }),
}));

import app from '../src/app.js';

process.env.JWT_SECRET = 'test-secret';

function authToken() {
  return jwt.sign({ username: 'tester' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const validEvent = {
  experiment: 'home_gym_layout',
  variant: 'A',
  eventType: 'impression',
  userId: 'user-123',
};

beforeEach(() => {
  mocks.experimentEvent.create.mockReset();
  mocks.experimentEvent.findMany.mockReset();
  mocks.experimentEvent.create.mockResolvedValue({ id: 'evt-1', ...validEvent });
});

describe('POST /experiments/event', () => {
  it('records a valid event', async () => {
    mocks.experimentEvent.create.mockResolvedValue({ id: 'evt-1', ...validEvent });
    const res = await request(app)
      .post('/experiments/event')
      .set('Authorization', `Bearer ${authToken()}`)
      .send(validEvent);
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.event.id).toBe('evt-1');
    expect(mocks.experimentEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ experiment: 'home_gym_layout', variant: 'A' }) })
    );
  });

  it('rejects an invalid event with 400', async () => {
    const res = await request(app)
      .post('/experiments/event')
      .set('Authorization', `Bearer ${authToken()}`)
      .send({ ...validEvent, variant: 'C' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
    expect(mocks.experimentEvent.create).not.toHaveBeenCalled();
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/experiments/event').send(validEvent);
    expect(res.status).toBe(401);
  });
});

describe('GET /experiments/results', () => {
  it('returns aggregated results for the experiment', async () => {
    mocks.experimentEvent.findMany.mockResolvedValue([
      { variant: 'A', eventType: 'impression' },
      { variant: 'A', eventType: 'impression' },
      { variant: 'A', eventType: 'conversion' },
      { variant: 'B', eventType: 'impression' },
      { variant: 'B', eventType: 'conversion' },
    ]);
    const res = await request(app)
      .get('/experiments/results?experiment=home_gym_layout')
      .set('Authorization', `Bearer ${authToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.experiment).toBe('home_gym_layout');
    expect(res.body.variants.A.impressions).toBe(2);
    expect(res.body.variants.A.conversions).toBe(1);
    expect(res.body.variants.B.impressions).toBe(1);
    expect(res.body.variants.B.conversions).toBe(1);
    expect(mocks.experimentEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { experiment: 'home_gym_layout' } })
    );
  });

  it('requires the experiment query param', async () => {
    const res = await request(app)
      .get('/experiments/results')
      .set('Authorization', `Bearer ${authToken()}`);
    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/experiments/results?experiment=home_gym_layout');
    expect(res.status).toBe(401);
  });
});
