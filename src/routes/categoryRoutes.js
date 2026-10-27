const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', validateObjectId('id'), categoryController.getCategoryById);

// Protected routes (Require JWT authentication)
router.post('/', authenticate, categoryController.createCategory);
router.put('/:id', authenticate, validateObjectId('id'), categoryController.updateCategory);
router.delete('/:id', authenticate, validateObjectId('id'), categoryController.deleteCategory);

module.exports = router;
