const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const courseRoutes = require('./courseRoutes');

// API Root / Health Check
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Course Portal REST API is operational',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      categories: {
        list: 'GET /api/categories',
        detail: 'GET /api/categories/:id',
        create: 'POST /api/categories',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id'
      },
      courses: {
        list: 'GET /api/courses',
        detail: 'GET /api/courses/:id',
        create: 'POST /api/courses',
        update: 'PUT /api/courses/:id',
        delete: 'DELETE /api/courses/:id'
      }
    }
  });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);

module.exports = router;
