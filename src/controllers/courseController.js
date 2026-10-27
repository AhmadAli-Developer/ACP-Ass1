const mongoose = require('mongoose');
const Course = require('../models/Course');
const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private
 */
const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, price, level } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return sendError(
        res,
        400,
        'Please provide title, description, and a valid category ID'
      );
    }

    // Validate category ObjectId format
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return sendError(res, 400, 'Invalid category ID format');
    }

    // Check that the category exists in the database
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return sendError(res, 400, 'The specified category does not exist');
    }

    const course = await Course.create({
      title: title.trim(),
      description: description.trim(),
      category,
      price: price !== undefined ? Number(price) : 0,
      level: level || 'Beginner',
      createdBy: req.user._id
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email');

    return sendSuccess(res, 201, 'Course created successfully', {
      course: populatedCourse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all courses with optional category and search filters
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = async (req, res, next) => {
  try {
    const { category, level, search } = req.query;
    const filter = {};

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      }
    }

    if (level) {
      filter.level = level;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(filter)
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(
      res,
      200,
      'Courses retrieved successfully',
      { courses },
      { count: courses.length }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email');

    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    return sendSuccess(res, 200, 'Course retrieved successfully', { course });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course by ID
 * @route   PUT /api/courses/:id
 * @access  Private
 */
const updateCourse = async (req, res, next) => {
  try {
    const { title, description, category, price, level } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    // If category is being updated, verify it exists
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return sendError(res, 400, 'Invalid category ID format');
      }
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return sendError(res, 400, 'The specified category does not exist');
      }
      course.category = category;
    }

    if (title !== undefined) course.title = title.trim();
    if (description !== undefined) course.description = description.trim();
    if (price !== undefined) course.price = Number(price);
    if (level !== undefined) course.level = level;

    await course.save();

    const updatedCourse = await Course.findById(course._id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email');

    return sendSuccess(res, 200, 'Course updated successfully', {
      course: updatedCourse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course by ID
 * @route   DELETE /api/courses/:id
 * @access  Private
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    await Course.findByIdAndDelete(course._id);

    return sendSuccess(res, 200, 'Course deleted successfully', {
      deletedId: course._id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};
