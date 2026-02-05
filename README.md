# TaskFlow - Project Management API

A comprehensive project and task management platform that enables teams to organize work, collaborate efficiently, and track project progress.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Project Management**: Create, read, update, and delete projects with team collaboration
- **Task Management**: Comprehensive task CRUD operations with status and priority tracking
- **Task Comments**: Add and manage comments on tasks for team communication
- **Role-Based Access Control**: Project owner and team member roles with appropriate permissions
- **Team Member Management**: Add and remove team members from projects
- **API Documentation**: Swagger/OpenAPI documentation at `/api-docs`

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs for password hashing
- **Documentation**: Swagger/OpenAPI
- **Validation**: express-validator

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
└── swagger.js               # Swagger documentation setup
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

### Running the Application

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The API will be available at `http://localhost:5000`
Swagger documentation will be available at `http://localhost:5000/api-docs`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

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
```

5. Deploy:
```bash
git push heroku main
```

## Security Features

- **Password Hashing**: Bcryptjs with salt rounds (10+)
- **JWT Authentication**: Stateless, secure token-based authentication
- **Input Validation**: Mongoose schema validation and express-validator
- **CORS Protection**: Configurable CORS origins
- **Rate Limiting**: Prevents brute-force attacks
- **Authorization Checks**: Role-based access control on protected endpoints
- **Error Handling**: Generic error messages to prevent information disclosure

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
