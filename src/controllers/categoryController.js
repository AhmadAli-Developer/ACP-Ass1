const Category = require('../models/Category');
const Course = require('../models/Course');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return sendError(res, 400, 'Category name is required');
    }

    // Check for existing category with same name (case-insensitive)
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existing) {
      return sendError(res, 400, 'A category with this name already exists');
    }

    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      createdBy: req.user._id
    });

    return sendSuccess(res, 201, 'Category created successfully', { category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(
      res,
      200,
      'Categories retrieved successfully',
      { categories },
      { count: categories.length }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('createdBy', 'name email');

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    return sendSuccess(res, 200, 'Category retrieved successfully', { category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category by ID
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    // If changing name, ensure uniqueness
    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      });

      if (duplicate) {
        return sendError(res, 400, 'Another category with this name already exists');
      }
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    await category.save();

    return sendSuccess(res, 200, 'Category updated successfully', { category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category by ID
 * @route   DELETE /api/categories/:id
 * @access  Private
 * Note: Prevents deletion if category has linked courses
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    // Check if category is used by existing courses
    const courseCount = await Course.countDocuments({ category: category._id });
    if (courseCount > 0) {
      return sendError(
        res,
        400,
        `Cannot delete category: it is currently assigned to ${courseCount} course(s). Delete or reassign the courses first.`
      );
    }

    await Category.findByIdAndDelete(category._id);

    return sendSuccess(res, 200, 'Category deleted successfully', {
      deletedId: category._id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
