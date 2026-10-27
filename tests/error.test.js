const request = require('supertest');
const app = require('../src/app');

describe('Error Handling Middleware', () => {
  it('should return 404 for unknown route GET /api/nonexistent-endpoint', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route GET /api/nonexistent-endpoint not found');
  });

  it('should return 404 for unknown route POST /api/random/unknown', async () => {
    const res = await request(app).post('/api/random/unknown').send({ test: true });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return root welcome payload on GET /', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.apiRoot).toBe('/api');
  });

  it('should return API overview and endpoint guide on GET /api', async () => {
    const res = await request(app).get('/api');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.endpoints).toBeDefined();
    expect(res.body.endpoints.auth).toBeDefined();
    expect(res.body.endpoints.categories).toBeDefined();
    expect(res.body.endpoints.courses).toBeDefined();
  });
});
