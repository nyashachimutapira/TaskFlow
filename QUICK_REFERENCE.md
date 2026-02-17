# TaskFlow API - Quick Reference Guide

## 🚀 Quick Start

### Live Application
- **URL**: https://taskflow-8gph.onrender.com
- **API Docs**: https://taskflow-8gph.onrender.com/api-docs
- **Health Check**: https://taskflow-8gph.onrender.com/health

### Run Locally
```bash
npm install
npm start        # Production
npm run dev      # Development with nodemon
npm test         # Run tests
```

---

## 📚 API Endpoints Summary

### Authentication (6 endpoints)
```
POST   /api/auth/register          Create new user
POST   /api/auth/login             User login (returns JWT)
GET    /api/auth/profile           Get user profile (protected)
PUT    /api/auth/profile           Update profile (protected)
GET    /api/auth/google            Google OAuth login
GET    /api/auth/github            GitHub OAuth login
```

### Projects (7 endpoints)
```
POST   /api/projects               Create project (protected)
GET    /api/projects               Get all projects (protected)
GET    /api/projects/{projectId}   Get single project (protected)
PUT    /api/projects/{projectId}   Update project (protected, owner)
DELETE /api/projects/{projectId}   Delete project (protected, owner)
POST   /api/projects/{projectId}/members         Add team member
DELETE /api/projects/{projectId}/members/{userId} Remove team member
```

### Tasks (7 endpoints)
```
POST   /api/projects/{projectId}/tasks      Create task (protected)
GET    /api/projects/{projectId}/tasks      Get all tasks (protected)
GET    /api/tasks/{taskId}                  Get single task (protected)
PUT    /api/tasks/{taskId}                  Update task (protected)
DELETE /api/tasks/{taskId}                  Delete task (protected, owner)
PATCH  /api/tasks/{taskId}/status           Update status (protected)
PATCH  /api/tasks/{taskId}/assign           Assign task (protected, owner)
```

### Comments (4 endpoints)
```
POST   /api/tasks/{taskId}/comments        Create comment (protected)
GET    /api/tasks/{taskId}/comments        Get all comments (protected)
PUT    /api/comments/{commentId}           Update comment (protected, author)
DELETE /api/comments/{commentId}           Delete comment (protected)
```

---

## 🔐 Authentication

### Register User
```bash
curl -X POST https://taskflow-8gph.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }'
```

### Login
```bash
curl -X POST https://taskflow-8gph.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
# Returns: { token: "eyJhbGciOiJIUzI1NiIs..." }
```

### Use Token
```bash
# Add to Authorization header
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://taskflow-8gph.onrender.com/api/projects
```

---

## 📊 Data Validation

### Validation Rules

**Auth**:
- username: ≥ 3 characters
- email: valid email format
- password: ≥ 6 characters
- fullName: required

**Projects**:
- name: ≥ 3 characters (required)
- description: optional

**Tasks**:
- title: ≥ 3 characters (required)
- priority: 'low' | 'medium' | 'high' (optional)
- status: 'to-do' | 'in-progress' | 'completed'

**Comments**:
- content: required (non-empty)

### Invalid Request (400)
```bash
curl -X POST https://taskflow-8gph.onrender.com/api/projects \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "ab"}' # Too short!

# Response: 400 Bad Request
# { "errors": [{ "msg": "Project name must be at least 3 characters" }] }
```

---

## 🔄 Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET, PUT, DELETE successful |
| 201 | Created | POST successful, resource created |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

---

## 📝 Full CRUD Example

### 1. Create Project
```bash
TOKEN="your_jwt_token"

curl -X POST https://taskflow-8gph.onrender.com/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete redesign of company website"
  }'

# Response (201):
# {
#   "message": "Project created successfully",
#   "project": {
#     "_id": "507f1f77bcf86cd799439011",
#     "name": "Website Redesign",
#     "description": "Complete redesign of company website",
#     "ownerId": "...",
#     "teamMembers": ["..."]
#   }
# }
```

### 2. Read (Get All)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://taskflow-8gph.onrender.com/api/projects

# Response (200):
# {
#   "count": 1,
#   "projects": [{ /* project data */ }]
# }
```

### 3. Read (Get Single)
```bash
PROJECT_ID="507f1f77bcf86cd799439011"

curl -H "Authorization: Bearer $TOKEN" \
  https://taskflow-8gph.onrender.com/api/projects/$PROJECT_ID

# Response (200): { /* project data */ }
```

### 4. Update
```bash
curl -X PUT https://taskflow-8gph.onrender.com/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign - Phase 2",
    "description": "Updated scope"
  }'

# Response (200): { /* updated project */ }
```

### 5. Delete
```bash
curl -X DELETE https://taskflow-8gph.onrender.com/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"

# Response (200): { "message": "Project deleted successfully" }
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Output Example
```
PASS  __tests__/projectController.test.js
PASS  __tests__/taskController.test.js
PASS  __tests__/commentController.test.js

Test Suites: 3 passed, 3 total
Tests:       30 passed, 30 total
```

### Test Coverage
- ✅ GET all resources
- ✅ GET single resource
- ✅ POST create (validation)
- ✅ PUT update (validation)
- ✅ DELETE resource
- ✅ 401 Unauthorized without token
- ✅ 403 Forbidden (authorization)
- ✅ 404 Not found

---

## 🛠️ Environment Variables

Required for production:

```env
# Server
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://taskflow-8gph.onrender.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskflow

# Auth
JWT_SECRET=strong-random-secret-key
SESSION_SECRET=strong-random-secret-key

# OAuth - Google
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# OAuth - GitHub
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Frontend
FRONTEND_URL=https://taskflow-8gph.onrender.com
```

---

## 🔗 OAuth Flows

### Google OAuth
```
1. User clicks: GET /api/auth/google
2. Redirected to Google login
3. User authenticates
4. Google redirects to: /api/auth/google/callback
5. API returns JWT token
6. Frontend redirects with token
```

### GitHub OAuth
```
1. User clicks: GET /api/auth/github
2. Redirected to GitHub login
3. User authenticates
4. GitHub redirects to: /api/auth/github/callback
5. API returns JWT token
6. Frontend redirects with token
```

---

## 📁 Project Structure

```
TaskFlow/
├── server.js                 # Main entry point
├── package.json
├── swagger.js               # Swagger config
│
├── config/
│   ├── database.js          # MongoDB connection
│   └── passport.js          # OAuth strategies
│
├── controllers/
│   ├── authController.js
│   ├── projectController.js
│   ├── taskController.js
│   └── commentController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   ├── singleTaskRoutes.js
│   └── commentRoutes.js
│
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   ├── errorHandler.js      # Error handling
│   └── validation.js        # Input validation
│
├── models/
│   ├── User.js
│   ├── Project.js
│   ├── Task.js
│   └── Comment.js
│
├── services/
│   ├── tokenService.js      # JWT operations
│   └── passwordService.js   # Password hashing
│
├── __tests__/
│   ├── projectController.test.js
│   ├── taskController.test.js
│   └── commentController.test.js
│
└── docs/
    ├── README.md
    ├── DEPLOYMENT.md
    ├── VIDEO_DEMO_SCRIPT.md
    ├── RUBRIC_COMPLIANCE.md
    └── SUBMISSION_GUIDE.md
```

---

## 🚨 Common Errors

### 401 Unauthorized
```json
{ "message": "No token provided" }
```
**Solution**: Add Authorization header with Bearer token

### 403 Forbidden
```json
{ "message": "Not authorized to access this project" }
```
**Solution**: User must be project owner or team member

### 404 Not Found
```json
{ "message": "Project not found" }
```
**Solution**: Check resource ID is correct

### 400 Bad Request
```json
{
  "errors": [
    { "msg": "Project name must be at least 3 characters" }
  ]
}
```
**Solution**: Fix validation errors (see Data Validation section)

---

## 🔍 Swagger UI Testing

1. Go to: https://taskflow-8gph.onrender.com/api-docs
2. Authorize with Bearer token:
   - Click "Authorize" button
   - Paste: `Bearer YOUR_JWT_TOKEN`
   - Click "Authorize"
3. Try each endpoint:
   - Click endpoint
   - Click "Try it out"
   - Enter parameters
   - Click "Execute"
   - View response

---

## 📊 Database Schema

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  createdAt: Date
}
```

### Project
```javascript
{
  name: String,
  description: String,
  ownerId: ObjectId (User),
  teamMembers: [ObjectId] (Users),
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  title: String,
  description: String,
  projectId: ObjectId (Project),
  assignedTo: ObjectId (User),
  createdBy: ObjectId (User),
  priority: String (low/medium/high),
  status: String (to-do/in-progress/completed),
  dueDate: Date,
  comments: [ObjectId] (Comments),
  createdAt: Date,
  updatedAt: Date
}
```

### Comment
```javascript
{
  content: String,
  taskId: ObjectId (Task),
  authorId: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Key Features

✅ **OAuth 2.0** - Google & GitHub authentication  
✅ **JWT Tokens** - Stateless authentication  
✅ **MongoDB** - Production database  
✅ **Validation** - Input validation on all routes  
✅ **Error Handling** - Comprehensive error management  
✅ **Testing** - 30+ unit tests  
✅ **Swagger Docs** - Interactive API documentation  
✅ **CORS** - Configurable cross-origin requests  
✅ **Rate Limiting** - DDoS protection  
✅ **Session Security** - Secure cookies  

---

## 📞 Useful Links

- **Repository**: https://github.com/nyashachimutapira/taskflow
- **Live API**: https://taskflow-8gph.onrender.com
- **Swagger UI**: https://taskflow-8gph.onrender.com/api-docs
- **Documentation**: See README.md and other .md files
- **Deployment**: Render.com

---

## ✅ Submission Checklist

- [ ] Code committed to GitHub
- [ ] `.env` in `.gitignore`
- [ ] All tests passing (`npm test`)
- [ ] Application deployed and running
- [ ] Video demonstration recorded
- [ ] README includes individual contributions
- [ ] All documentation files present
- [ ] OAuth endpoints working
- [ ] All CRUD operations working
- [ ] Validation working (400 errors)
- [ ] Authorization working (403 errors)
- [ ] Error handling working (404, 500 errors)

---

**All systems go! Ready for submission! 🚀**
