const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const { hashPassword } = require('../services/passwordService');
const { generateToken } = require('../services/tokenService');
const connectDB = require('../config/database');

let app;
let testUserId;
let testProjectId;
let authToken;

const mockUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User',
};

const mockProject = {
  name: 'Test Project',
  description: 'A test project',
};

beforeAll(async () => {
  // Don't connect to real DB during tests - mock instead
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }
  
  app = require('../server');
  
  // Wait for DB connection
  await new Promise(resolve => setTimeout(resolve, 1000));
});

beforeEach(async () => {
  try {
    // Clear collections
    await User.deleteMany({});
    await Project.deleteMany({});

    // Create test user
    const hashedPassword = await hashPassword(mockUser.password);
    const user = await User.create({
      username: mockUser.username,
      email: mockUser.email,
      password: hashedPassword,
      fullName: mockUser.fullName,
    });

    testUserId = user._id.toString();
    authToken = generateToken(testUserId);
  } catch (error) {
    console.error('Setup error:', error);
  }
});

afterEach(async () => {
  try {
    await User.deleteMany({});
    await Project.deleteMany({});
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

afterAll(async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Disconnect error:', error);
  }
});

describe('Project Controller - GET Operations', () => {
  test('GET /api/projects - should get all projects for authenticated user', async () => {
    // Create a test project
    const project = await Project.create({
      name: mockProject.name,
      description: mockProject.description,
      ownerId: testUserId,
      teamMembers: [testUserId],
    });

    const response = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.projects).toHaveLength(1);
    expect(response.body.projects[0].name).toBe(mockProject.name);
  });

  test('GET /api/projects/{projectId} - should get single project', async () => {
    const project = await Project.create({
      name: mockProject.name,
      description: mockProject.description,
      ownerId: testUserId,
      teamMembers: [testUserId],
    });

    const response = await request(app)
      .get(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(mockProject.name);
    expect(response.body._id.toString()).toBe(project._id.toString());
  });

  test('GET /api/projects/{projectId} - should return 404 for non-existent project', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/projects/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Project not found');
  });

  test('GET /api/projects - should return 401 without auth token', async () => {
    const response = await request(app).get('/api/projects');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});

describe('Project Controller - POST Operations', () => {
  test('POST /api/projects - should create new project', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockProject);

    expect(response.status).toBe(201);
    expect(response.body.project.name).toBe(mockProject.name);
    expect(response.body.project.description).toBe(mockProject.description);
  });

  test('POST /api/projects - should validate required fields', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'No name' });

    expect(response.status).toBe(400);
  });

  test('POST /api/projects - should return 401 without auth token', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send(mockProject);

    expect(response.status).toBe(401);
  });
});

describe('Project Controller - PUT Operations', () => {
  beforeEach(async () => {
    const project = await Project.create({
      name: mockProject.name,
      description: mockProject.description,
      ownerId: testUserId,
      teamMembers: [testUserId],
    });
    testProjectId = project._id.toString();
  });

  test('PUT /api/projects/{projectId} - should update project', async () => {
    const updateData = {
      name: 'Updated Project',
      description: 'Updated description',
    };

    const response = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.project.name).toBe(updateData.name);
    expect(response.body.project.description).toBe(updateData.description);
  });

  test('PUT /api/projects/{projectId} - should validate data', async () => {
    const response = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '' }); // Empty name should fail validation

    expect(response.status).toBe(400);
  });

  test('PUT /api/projects/{projectId} - should return 404 for non-existent project', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .put(`/api/projects/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated' });

    expect(response.status).toBe(404);
  });
});

describe('Project Controller - DELETE Operations', () => {
  beforeEach(async () => {
    const project = await Project.create({
      name: mockProject.name,
      description: mockProject.description,
      ownerId: testUserId,
      teamMembers: [testUserId],
    });
    testProjectId = project._id.toString();
  });

  test('DELETE /api/projects/{projectId} - should delete project', async () => {
    const response = await request(app)
      .delete(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Project deleted successfully');

    // Verify deletion
    const deletedProject = await Project.findById(testProjectId);
    expect(deletedProject).toBeNull();
  });

  test('DELETE /api/projects/{projectId} - should return 404 for non-existent project', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/projects/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Project not found');
  });

  test('DELETE /api/projects/{projectId} - should return 401 without auth token', async () => {
    const response = await request(app).delete(`/api/projects/${testProjectId}`);

    expect(response.status).toBe(401);
  });
});
