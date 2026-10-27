# Course Portal REST API — Modular MVC Architecture

A production-ready, modular MVC REST API built using **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**. Designed for university coursework, demonstrating industry best practices including password hashing with bcrypt, JWT token authentication, relational document modeling, robust input validation, centralized async error handling, and comprehensive automated testing.

---

## 📑 Table of Contents
1. [Features](#features)
2. [Modular MVC Project Architecture](#modular-mvc-project-architecture)
3. [Prerequisites](#prerequisites)
4. [Environment Setup](#environment-setup)
5. [Database Setup (Local & MongoDB Atlas)](#database-setup-local--mongodb-atlas)
6. [Installation & Running](#installation--running)
7. [Running Automated Tests](#running-automated-tests)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Postman Collection & Testing Guide](#postman-collection--testing-guide)
10. [Five-Screenshot Postman Evidence Checklist](#five-screenshot-postman-evidence-checklist)

---

## 🌟 Features

- **Authentication & Security**:
  - `POST /api/auth/register` with duplicate email detection and bcrypt hashing (10 salt rounds).
  - `POST /api/auth/login` with JWT token issuance (`7d` expiration).
  - Password hashes are completely stripped from JSON responses via schema-level serializers.
  - Protected endpoints require Bearer JWT header: `Authorization: Bearer <token>`.
- **Modular MVC Design**:
  - Independent directories for **Models**, **Views/Responses**, **Controllers**, **Routes**, **Middleware**, and **Config**.
- **Category CRUD (`/api/categories`)**:
  - Full CRUD operations with public read and authenticated write/delete.
  - Prevents deletion of categories that have linked courses.
- **Course CRUD (`/api/courses`)**:
  - Full CRUD with populated category data.
  - Verifies category references exist prior to course creation or updates.
- **Safe Error Handling**:
  - Centralized error middleware handling `CastError`, `ValidationError`, duplicate key `11000`, `JsonWebTokenError`, and `TokenExpiredError`.
  - Malformed IDs safely return `400 Bad Request`.
  - Nonexistent valid IDs return `404 Not Found`.
  - Unknown URLs trigger a centralized 404 handler.
- **Automated Testing Suite**:
  - Automated tests using **Jest**, **Supertest**, and **mongodb-memory-server** (no external MongoDB server required to run tests!).

---

## 🏛 Modular MVC Project Architecture

```
assignment 2/
├── .env.example               # Template for environment variables
├── .env                       # Local environment configuration (do not commit secrets)
├── .gitignore                 # Ignores node_modules, .env, and logs
├── package.json               # Dependencies and scripts (start, dev, test)
├── postman_collection.json    # Ready-to-import Postman API tests
├── README.md                  # Complete documentation and setup guide
├── src/
│   ├── config/
│   │   └── db.js              # Mongoose database connection logic
│   ├── controllers/
│   │   ├── authController.js      # Register, login, and user profile handlers
│   │   ├── categoryController.js  # Category CRUD logic & course relation check
│   │   └── courseController.js    # Course CRUD logic & category validation
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT token extraction and verification
│   │   ├── errorMiddleware.js     # Centralized error and 404 handlers
│   │   └── validateMiddleware.js  # MongoDB ObjectId and field validators
│   ├── models/
│   │   ├── Category.js        # Category schema & model
│   │   ├── Course.js          # Course schema with Category reference
│   │   └── User.js            # User schema with bcrypt pre-save hook
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth routes
│   │   ├── categoryRoutes.js  # /api/categories routes
│   │   ├── courseRoutes.js    # /api/courses routes
│   │   └── index.js           # Master router & /api health check
│   ├── utils/
│   │   └── apiResponse.js     # Standardized JSON response helpers
│   ├── app.js                 # Express application configuration
│   └── server.js              # Server bootstrapper & listener
└── tests/
    ├── setup.js               # In-memory MongoDB lifecycle for tests
    ├── auth.test.js           # Tests for registration, login, JWT
    ├── category.test.js       # Tests for Category CRUD & constraint checks
    ├── course.test.js         # Tests for Course CRUD & category validation
    └── error.test.js          # Tests for 404 and error responses
```

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your computer:
1. **Node.js** (v18.x, v20.x, or v24.x recommended). Check with:
   ```bash
   node -v
   ```
2. **NPM** (v9.x or later). Check with:
   ```bash
   npm -v
   ```
3. A running **MongoDB** instance (Local Community Edition or MongoDB Atlas cloud).

---

## ⚙️ Environment Setup

1. Check that the `.env` file exists in the root directory (copied from `.env.example`):
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env
   ```
2. Open `.env` and verify the values:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/course_portal
   JWT_SECRET=super_secret_assignment_jwt_key_2026
   JWT_EXPIRES_IN=7d
   ```

---

## 🗄 Database Setup (Manual Steps)

You can choose either **Option A (Local MongoDB)** or **Option B (Free MongoDB Atlas Cloud)**:

### Option A: Local MongoDB Community Edition
1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Install MongoDB on your machine (select "Run as Network Service").
3. Ensure the service is running:
   ```powershell
   # Windows PowerShell:
   net start MongoDB
   ```
4. In `.env`, ensure:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/course_portal
   ```

### Option B: Free Cloud MongoDB Atlas (Recommended if you don't have local MongoDB)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and register a free account.
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g., username `admin`, password `MySecurePassword123`).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers (Node.js)** and copy your connection string.
6. Replace `<password>` with your database user password and update your `.env`:
   ```env
   MONGODB_URI=mongodb+srv://admin:MySecurePassword123@cluster0.abcde.mongodb.net/course_portal?retryWrites=true&w=majority
   ```

---

## 🚀 Installation & Running

### 1. Install Dependencies
```bash
npm install
```
*(On Windows PowerShell if scripts are restricted, run: `npm.cmd install`)*

### 2. Start the Server
- **Production / Standard Mode**:
  ```bash
  npm start
  ```
- **Development Mode (Auto-reload on code change)**:
  ```bash
  npm run dev
  ```

Upon startup, you will see:
```text
====================================================
🚀 Server running in development mode
📡 Listening on: http://localhost:5000
📋 API Root:     http://localhost:5000/api
====================================================
[MongoDB] Connected successfully: 127.0.0.1/course_portal
```

---

## 🧪 Running Automated Tests

The project includes unit and integration tests powered by **Jest**, **Supertest**, and **mongodb-memory-server**. Tests spin up a temporary, in-memory MongoDB database automatically, meaning they pass even without a local MongoDB service running!

Run the test suite with:
```bash
npm test
```
*(Or on Windows PowerShell: `npm.cmd test`)*

### Test Coverage Highlights:
- **Authentication**: Successful registration, password hashing verification, JWT generation, duplicate email rejection, missing field validation, login credential verification, protected `/me` profile check.
- **Categories**: Category creation (authenticated vs unauthenticated), fetching all categories, fetching single category, updating category, duplicate name check, preventing deletion when linked courses exist, successful deletion when free.
- **Courses**: Course creation with foreign key Category verification, rejection of nonexistent or malformed category IDs, listing courses with populated category details, querying/searching courses, updating and deleting courses.
- **Error Handling**: Malformed ObjectId 400 rejection, valid format nonexistent 404 rejection, unknown route 404 handler, and uniform JSON response envelopes.

---

## 📡 API Endpoints Reference

Base URL: `http://localhost:5000`

### 1. Root & Health
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | API welcome message |
| `GET` | `/api` | Public | API route directory and operational status |

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Access | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ "name", "email", "password" }` | Register new user, hashes password, returns JWT |
| `POST` | `/api/auth/login` | Public | `{ "email", "password" }` | Authenticate user, returns JWT token |
| `GET` | `/api/auth/me` | Bearer Token | *(None)* | Returns current authenticated user profile |

### 3. Categories (`/api/categories`)
| Method | Endpoint | Access | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | *(None)* | Retrieve all categories |
| `GET` | `/api/categories/:id` | Public | *(None)* | Retrieve single category by ID |
| `POST` | `/api/categories` | Bearer Token | `{ "name", "description" }` | Create category (name must be unique) |
| `PUT` | `/api/categories/:id` | Bearer Token | `{ "name", "description" }` | Update category details |
| `DELETE` | `/api/categories/:id` | Bearer Token | *(None)* | Delete category (blocked if courses linked) |

### 4. Courses (`/api/courses`)
| Method | Endpoint | Access | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Public | Query: `?search=...&level=...` | Retrieve all courses with populated category |
| `GET` | `/api/courses/:id` | Public | *(None)* | Retrieve course by ID with category details |
| `POST` | `/api/courses` | Bearer Token | `{ "title", "description", "category", "price", "level" }` | Create course referencing valid Category |
| `PUT` | `/api/courses/:id` | Bearer Token | `{ "title", "description", "price", "level" }` | Update course fields |
| `DELETE` | `/api/courses/:id` | Bearer Token | *(None)* | Delete course |

---

## 📮 Postman Collection & Testing Guide

A ready-to-import Postman collection is included in the project:
`postman_collection.json`

### How to Import & Run in Postman:
1. Open Postman.
2. Click **Import** (top left).
3. Select or drag-and-drop the [postman_collection.json](postman_collection.json) file.
4. The collection is configured with automated test scripts that:
   - Save your `token` upon registering or logging in to the collection variable `{{authToken}}`.
   - Save newly created `categoryId` and `courseId` automatically for subsequent requests!
5. Start your server (`npm start`) and execute the requests sequentially.

---

## 📸 Five-Screenshot Postman Evidence Checklist

For your university assignment submission, take screenshots of the following 5 key operations in Postman:

1. **Screenshot 1: User Registration (`POST /api/auth/register`)**
   - **URL**: `http://localhost:5000/api/auth/register`
   - **Body (raw JSON)**:
     ```json
     {
       "name": "Jane Doe",
       "email": "jane@example.com",
       "password": "password123"
     }
     ```
   - **Expected Status**: `201 Created`
   - **Evidence Check**: Status code `201`, `success: true`, a valid JWT token returned in `data.token`, and verify the `password` field is NOT present in `data.user`.

2. **Screenshot 2: User Login (`POST /api/auth/login`)**
   - **URL**: `http://localhost:5000/api/auth/login`
   - **Body (raw JSON)**:
     ```json
     {
       "email": "jane@example.com",
       "password": "password123"
     }
     ```
   - **Expected Status**: `200 OK`
   - **Evidence Check**: Status code `200`, `success: true`, message `"Login successful"`, and the returned `token`.

3. **Screenshot 3: Create Category (`POST /api/categories`)**
   - **URL**: `http://localhost:5000/api/categories`
   - **Headers**: `Authorization: Bearer <your_jwt_token>`
   - **Body (raw JSON)**:
     ```json
     {
       "name": "Cloud Computing & DevOps",
       "description": "Docker, Kubernetes, AWS, and CI/CD pipelines"
     }
     ```
   - **Expected Status**: `201 Created`
   - **Evidence Check**: Status code `201`, `data.category._id` generated, and category created by the logged-in user.

4. **Screenshot 4: Create Course with Category Link (`POST /api/courses`)**
   - **URL**: `http://localhost:5000/api/courses`
   - **Headers**: `Authorization: Bearer <your_jwt_token>`
   - **Body (raw JSON)**:
     ```json
     {
       "title": "Mastering Docker & Microservices",
       "description": "Hands-on guide to containerization and service mesh.",
       "category": "<paste_category_id_from_screenshot_3>",
       "price": 39.99,
       "level": "Intermediate"
     }
     ```
   - **Expected Status**: `201 Created`
   - **Evidence Check**: Status code `201`, populated category details under `data.course.category`, and status showing course successfully linked.

5. **Screenshot 5: Error Handling & Security Evidence (`DELETE /api/categories/:id` or 400/404 handling)**
   - **Option A (Safe Relation Constraint)**: Call `DELETE /api/categories/<category_id>` that has courses attached.
     - **Expected Status**: `400 Bad Request`
     - **Message**: `"Cannot delete category: it is currently assigned to 1 course(s). Delete or reassign the courses first."`
   - **Option B (Malformed ID Handling)**: Call `GET /api/courses/not-a-valid-id`.
     - **Expected Status**: `400 Bad Request`
     - **Message**: `"Invalid ID format for parameter 'id'."`
   - **Option C (Unauthorized Request)**: Call `POST /api/courses` with no `Authorization` header.
     - **Expected Status**: `401 Unauthorized`
     - **Message**: `"Access denied. No token provided."`
