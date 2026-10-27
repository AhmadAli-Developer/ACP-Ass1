const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

describe('Course API (/api/courses)', () => {
  let authToken;
  let categoryId;

  beforeEach(async () => {
    // 1. Register instructor
    const authRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Professor Smith',
        email: 'smith@example.com',
        password: 'password123'
      });
    authToken = authRes.body.data.token;

    // 2. Create category
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Web Engineering',
        description: 'Frontend and Backend technologies'
      });
    categoryId = catRes.body.data.category._id;
  });

  describe('POST /api/courses', () => {
    it('should create a new course with valid category reference', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Fullstack Express & React',
          description: 'Learn to build production-grade web applications',
          category: categoryId,
          price: 49.99,
          level: 'Intermediate'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.title).toBe('Fullstack Express & React');
      expect(res.body.data.course.category._id).toBe(categoryId);
      expect(res.body.data.course.category.name).toBe('Web Engineering');
    });

    it('should return 401 when creating course without token', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({
          title: 'Unauthorized Course',
          description: 'No token supplied',
          category: categoryId
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Incomplete Course'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide title, description, and a valid category ID');
    });

    it('should return 400 when category ID is malformed', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Course with Bad Category ID',
          description: 'Valid description text here',
          category: 'invalid-object-id'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid category ID format');
    });

    it('should return 400 when category ID is a valid ObjectId but nonexistent in DB', async () => {
      const nonexistentCatId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Course with Phantom Category',
          description: 'Valid description text here',
          category: nonexistentCatId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('The specified category does not exist');
    });
  });

  describe('GET /api/courses', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Node.js Fundamentals',
          description: 'Async JS, Event Loop, Modules',
          category: categoryId
        });
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'MongoDB Mastery',
          description: 'Schema design and aggregation pipelines',
          category: categoryId
        });
    });

    it('should retrieve all courses publicly', async () => {
      const res = await request(app).get('/api/courses');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.courses)).toBe(true);
      expect(res.body.data.courses.length).toBe(2);
      expect(res.body.data.courses[0].category.name).toBe('Web Engineering');
    });

    it('should filter courses by search keyword', async () => {
      const res = await request(app).get('/api/courses?search=MongoDB');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.courses.length).toBe(1);
      expect(res.body.data.courses[0].title).toBe('MongoDB Mastery');
    });
  });

  describe('GET /api/courses/:id', () => {
    let courseId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Express REST Architecture',
          description: 'Clean MVC and error handling patterns',
          category: categoryId
        });
      courseId = res.body.data.course._id;
    });

    it('should retrieve single course by valid ID', async () => {
      const res = await request(app).get(`/api/courses/${courseId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.title).toBe('Express REST Architecture');
    });

    it('should return 404 for valid formatted but nonexistent course ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/courses/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Course not found');
    });

    it('should return 400 for malformed course ID', async () => {
      const res = await request(app).get('/api/courses/not-an-id-999');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid ID format');
    });
  });

  describe('PUT /api/courses/:id', () => {
    let courseId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Initial Title',
          description: 'Initial Description',
          category: categoryId
        });
      courseId = res.body.data.course._id;
    });

    it('should update course when authenticated', async () => {
      const res = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          price: 29.99,
          level: 'Advanced'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.title).toBe('Updated Title');
      expect(res.body.data.course.price).toBe(29.99);
      expect(res.body.data.course.level).toBe('Advanced');
    });

    it('should return 401 when updating course without token', async () => {
      const res = await request(app)
        .put(`/api/courses/${courseId}`)
        .send({ title: 'Unauthorized Edit' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when updating course with invalid category ID', async () => {
      const res = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'bad-id' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when updating nonexistent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Ghost Course' });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    let courseId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Course to Delete',
          description: 'Will be deleted soon',
          category: categoryId
        });
      courseId = res.body.data.course._id;
    });

    it('should return 401 when deleting course without token', async () => {
      const res = await request(app).delete(`/api/courses/${courseId}`);
      expect(res.statusCode).toBe(401);
    });

    it('should delete course successfully when authenticated', async () => {
      const res = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');

      const check = await request(app).get(`/api/courses/${courseId}`);
      expect(check.statusCode).toBe(404);
    });

    it('should return 404 when deleting nonexistent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
