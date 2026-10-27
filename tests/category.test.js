const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Course = require('../src/models/Course');

describe('Category API (/api/categories)', () => {
  let authToken;

  beforeEach(async () => {
    // Register and obtain valid token
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Instructor Bob',
        email: 'bob@example.com',
        password: 'password123'
      });
    authToken = res.body.data.token;
  });

  describe('POST /api/categories', () => {
    it('should create a category when authenticated', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Computer Science',
          description: 'Core concepts of computing and programming'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.name).toBe('Computer Science');
      expect(res.body.data.category._id).toBeDefined();
    });

    it('should return 401 when creating category without token', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Web Development' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when category name is missing', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Missing name' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('name is required');
    });

    it('should return 400 when creating a duplicate category name', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Data Science' });

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'data science' }); // case-insensitive check

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('GET /api/categories', () => {
    it('should retrieve all categories without authentication', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Category 1' });
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Category 2' });

      const res = await request(app).get('/api/categories');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.categories)).toBe(true);
      expect(res.body.data.categories.length).toBe(2);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should retrieve a category by valid existing ID', async () => {
      const created = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Artificial Intelligence' });

      const catId = created.body.data.category._id;

      const res = await request(app).get(`/api/categories/${catId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.name).toBe('Artificial Intelligence');
    });

    it('should return 404 for a valid formatted but nonexistent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/categories/${nonExistentId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for a malformed ID', async () => {
      const res = await request(app).get('/api/categories/not-a-valid-id-123');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid ID format');
    });
  });

  describe('PUT /api/categories/:id', () => {
    let catId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Old Category', description: 'Old desc' });
      catId = res.body.data.category._id;
    });

    it('should update category when authenticated', async () => {
      const res = await request(app)
        .put(`/api/categories/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Category', description: 'New desc' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.name).toBe('Updated Category');
      expect(res.body.data.category.description).toBe('New desc');
    });

    it('should return 401 when updating without token', async () => {
      const res = await request(app)
        .put(`/api/categories/${catId}`)
        .send({ name: 'No Token Update' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for nonexistent category ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let catId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'To Be Deleted' });
      catId = res.body.data.category._id;
    });

    it('should return 401 when deleting without token', async () => {
      const res = await request(app).delete(`/api/categories/${catId}`);
      expect(res.statusCode).toBe(401);
    });

    it('should delete category when authenticated and no courses are linked', async () => {
      const res = await request(app)
        .delete(`/api/categories/${catId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');

      // Verify it no longer exists
      const checkRes = await request(app).get(`/api/categories/${catId}`);
      expect(checkRes.statusCode).toBe(404);
    });

    it('should prevent deletion of category that still has courses linked (Requirement 7)', async () => {
      // Create a course linked to this category
      await Course.create({
        title: 'Linked Course 101',
        description: 'Test course attached to category',
        category: catId
      });

      const res = await request(app)
        .delete(`/api/categories/${catId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot delete category');
    });

    it('should return 404 when deleting nonexistent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
