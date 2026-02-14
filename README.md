# TaskFlow - Project Management API

A comprehensive project and task management platform that enables teams to organize work, collaborate efficiently, and track project progress.

## Features

- **User Authentication**: JWT-based authentication + OAuth (Google & GitHub) with secure password hashing
- **OAuth Integration**: Login with Google and GitHub accounts
- **Project Management**: Create, read, update, and delete projects with team collaboration
- **Task Management**: Comprehensive task CRUD operations with status and priority tracking
- **Task Comments**: Add and manage comments on tasks for team communication
- **Role-Based Access Control**: Project owner and team member roles with appropriate permissions
- **Team Member Management**: Add and remove team members from projects
- **API Documentation**: Swagger/OpenAPI documentation at `/api-docs`
- **Data Validation**: Comprehensive input validation on all routes
- **Unit Testing**: Full test coverage for all CRUD operations

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + Passport.js (OAuth)
- **Password Security**: bcryptjs for password hashing
- **OAuth Providers**: Google OAuth 2.0, GitHub OAuth 2.0
- **Documentation**: Swagger/OpenAPI
- **Validation**: express-validator
- **Testing**: Jest and Supertest
- **API Security**: Rate limiting, CORS, session management

## Project Structure

```
TaskFlow/
├── server.js                 # Entry point
├── package.json             # Dependencies
├── .env.example             # Environment variables template
│
├── config/
│   └── database.js          # MongoDB connection
│
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Project.js
│   ├── Task.js
│   └── Comment.js
│
├── controllers/             # Business logic
│   ├── authController.js
│   ├── projectController.js
│   ├── taskController.js
│   └── commentController.js
│
├── routes/                  # API routes
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   └── commentRoutes.js
│
├── middleware/              # Custom middleware
│   ├── authMiddleware.js    # JWT verification
│   ├── errorHandler.js      # Global error handling
│   └── validation.js        # Input validation
│
├── services/                # Reusable business logic
│   ├── tokenService.js      # JWT operations
│   └── passwordService.js   # Password hashing
│
├── __tests__/               # Unit tests
│   ├── projectController.test.js
│   ├── taskController.test.js
│   └── commentController.test.js
│
├── jest.config.js           # Jest configuration
├── swagger.js               # Swagger documentation setup
└── .env.example             # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nyashachimutapira/TaskFlow.git
cd TaskFlow
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Environment Variables

Create a `.env` file with the following variables:

```
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=24h

# Session
SESSION_SECRET=your_session_secret_key

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

### Running the Application

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

**Run tests**:
```bash
npm test
```

**Run tests in watch mode**:
```bash
npm run test:watch
```

The API will be available at `http://localhost:5000`
Swagger documentation will be available at `http://localhost:5000/api-docs`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/github` - GitHub OAuth login
- `GET /api/auth/github/callback` - GitHub OAuth callback

### Projects
- `POST /api/projects` - Create new project (protected)
- `GET /api/projects` - Get all projects for current user (protected)
- `GET /api/projects/{projectId}` - Get single project (protected)
- `PUT /api/projects/{projectId}` - Update project (protected, owner only)
- `DELETE /api/projects/{projectId}` - Delete project (protected, owner only)
- `POST /api/projects/{projectId}/members` - Add team member (protected, owner only)
- `DELETE /api/projects/{projectId}/members/{userId}` - Remove team member (protected, owner only)

### Tasks
- `POST /api/projects/{projectId}/tasks` - Create task (protected)
- `GET /api/projects/{projectId}/tasks` - Get all tasks in project (protected)
- `GET /api/tasks/{taskId}` - Get single task (protected)
- `PUT /api/tasks/{taskId}` - Update task (protected)
- `DELETE /api/tasks/{taskId}` - Delete task (protected, owner only)
- `PATCH /api/tasks/{taskId}/status` - Update task status (protected)
- `PATCH /api/tasks/{taskId}/assign` - Assign task to user (protected, owner only)

### Comments
- `POST /api/tasks/{taskId}/comments` - Add comment (protected)
- `GET /api/tasks/{taskId}/comments` - Get all comments (protected)
- `PUT /api/comments/{commentId}` - Update comment (protected, author only)
- `DELETE /api/comments/{commentId}` - Delete comment (protected, author or owner)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Deployment

### Heroku Deployment

1. Create a Heroku account and install Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create taskflow-api
```

4. Set environment variables:
```bash
heroku config:set MONGODB_URI=<your_mongodb_uri>
heroku config:set JWT_SECRET=<your_jwt_secret>
heroku config:set SESSION_SECRET=<your_session_secret>
heroku config:set GOOGLE_CLIENT_ID=<your_google_client_id>
heroku config:set GOOGLE_CLIENT_SECRET=<your_google_client_secret>
heroku config:set GITHUB_CLIENT_ID=<your_github_client_id>
heroku config:set GITHUB_CLIENT_SECRET=<your_github_client_secret>
heroku config:set NODE_ENV=production
```

5. Deploy:
```bash
git push heroku main
```

### Production Checklist

- [ ] Update `CORS_ORIGIN` to your frontend domain
- [ ] Set secure JWT_SECRET (strong random string)
- [ ] Set secure SESSION_SECRET (strong random string)
- [ ] Configure OAuth credentials for Google and GitHub
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas for production database
- [ ] Enable HTTPS (Heroku provides this by default)
- [ ] Set up proper error logging
- [ ] Review security headers and CORS settings
- [ ] Test all OAuth flows in production
- [ ] Run full test suite before deployment

## Testing

All CRUD operations have comprehensive unit tests:

- **Project Tests** (`projectController.test.js`):
  - GET all projects
  - GET single project
  - POST create project (with validation)
  - PUT update project (with validation)
  - DELETE project

- **Task Tests** (`taskController.test.js`):
  - GET all tasks in project
  - GET single task
  - POST create task (with validation)
  - PUT update task (with validation)
  - PATCH update task status
  - DELETE task

- **Comment Tests** (`commentController.test.js`):
  - GET all comments
  - POST create comment (with validation)
  - PUT update comment (with validation)
  - DELETE comment

Run tests with:
```bash
npm test
```

## Data Validation

All POST and PUT routes include comprehensive validation:

### Authentication
- Username: minimum 3 characters
- Email: valid email format
- Password: minimum 6 characters
- Full Name: required, non-empty

### Projects
- Name: minimum 3 characters (required)
- Description: optional

### Tasks
- Title: minimum 3 characters (required)
- Description: optional
- Priority: must be 'low', 'medium', or 'high'
- Status: must be 'to-do', 'in-progress', or 'completed'

### Comments
- Content: non-empty (required)

All validation errors return **400 Bad Request** with detailed error messages.

## Security Features

- **Password Hashing**: Bcryptjs with salt rounds (10+)
- **JWT Authentication**: Stateless, secure token-based authentication
- **OAuth Integration**: Secure OAuth 2.0 with Google and GitHub
- **Input Validation**: Mongoose schema validation and express-validator on all routes
- **CORS Protection**: Configurable CORS origins
- **Rate Limiting**: Prevents brute-force attacks (100 requests per 15 minutes)
- **Authorization Checks**: Role-based access control on protected endpoints
- **Error Handling**: Generic error messages to prevent information disclosure
- **Session Security**: Secure session configuration for OAuth

## Team

- **Team Member 1 (Lead)**: Project setup, authentication system, coordination
- **Team Member 2**: Project CRUD endpoints, team member management
- **Team Member 3**: Task CRUD endpoints, task operations
- **Team Member 4**: Comment CRUD endpoints, validation, error handling, testing

## Project Timeline

- **Week 04**: Project Proposal (CSE 341)
- **Week 05**: Project setup, MongoDB Atlas, Heroku deployment
- **Week 06**: Implement all endpoints and test with Postman
- **Week 07**: Video demo, final testing, submission

## Potential Stretch Goals

- Email notifications for task assignments
- File attachments for tasks
- Real-time updates with WebSockets
- Advanced search and filtering
- Task dependencies
- Recurring tasks
- Activity audit log
- Analytics and reports
- Two-factor authentication
- Slack/Discord integration

## License

MIT License - feel free to use this project for educational purposes.

## Support

For issues or questions, please create an issue on GitHub.
