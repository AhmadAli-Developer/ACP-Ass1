const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateMiddleware');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', validateObjectId('id'), courseController.getCourseById);

// Protected routes (Require JWT authentication)
router.post('/', authenticate, courseController.createCourse);
router.put('/:id', authenticate, validateObjectId('id'), courseController.updateCourse);
router.delete('/:id', authenticate, validateObjectId('id'), courseController.deleteCourse);

module.exports = router;
