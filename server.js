require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
require('./config/passport');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpec = require('./swagger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const singleTaskRoutes = require('./routes/singleTaskRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'taskflow-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CORS - Allow requests from Swagger and frontend
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://taskflow-8gph.onrender.com',
    'https://taskflow-8gph.onrender.com/api-docs',
    process.env.CORS_ORIGIN || '*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'TaskFlow API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', taskRoutes);
app.use('/api/tasks', singleTaskRoutes);
// Mount comment routes at both /api/tasks (for task-based comments) and /api/comments (for direct comment access)
app.use('/api/tasks', commentRoutes);
app.use('/api/comments', commentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Export app for testing
module.exports = app;
