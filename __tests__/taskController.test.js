const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { hashPassword } = require('../services/passwordService');
const { generateToken } = require('../services/tokenService');

let app;
let testUserId;
let testProjectId;
let testTaskId;
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

const mockTask = {
  title: 'Test Task',
  description: 'A test task',
  priority: 'high',
};

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }

  app = require('../server');
  await new Promise(resolve => setTimeout(resolve, 1000));
});

beforeEach(async () => {
  try {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    const hashedPassword = await hashPassword(mockUser.password);
    const user = await User.create({
      username: mockUser.username,
      email: mockUser.email,
      password: hashedPassword,
      fullName: mockUser.fullName,
    });

    testUserId = user._id.toString();
    authToken = generateToken(testUserId);

    const project = await Project.create({
      name: mockProject.name,
      description: mockProject.description,
      ownerId: testUserId,
      teamMembers: [testUserId],
    });

    testProjectId = project._id.toString();
  } catch (error) {
    console.error('Setup error:', error);
  }
});

afterEach(async () => {
  try {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
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

describe('Task Controller - GET Operations', () => {
  beforeEach(async () => {
    const task = await Task.create({
      title: mockTask.title,
      description: mockTask.description,
      projectId: testProjectId,
      createdBy: testUserId,
      priority: mockTask.priority,
    });
    testTaskId = task._id.toString();
  });

  test('GET /api/projects/{projectId}/tasks - should get all tasks in project', async () => {
    const response = await request(app)
      .get(`/api/projects/${testProjectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.tasks).toHaveLength(1);
    expect(response.body.tasks[0].title).toBe(mockTask.title);
  });

  test('GET /api/tasks/{taskId} - should get single task', async () => {
    const response = await request(app)
      .get(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(mockTask.title);
    expect(response.body._id.toString()).toBe(testTaskId);
  });

  test('GET /api/tasks/{taskId} - should return 404 for non-existent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/tasks/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found');
  });

  test('GET /api/projects/{projectId}/tasks - should return 401 without auth token', async () => {
    const response = await request(app).get(`/api/projects/${testProjectId}/tasks`);

    expect(response.status).toBe(401);
  });
});

describe('Task Controller - POST Operations', () => {
  test('POST /api/projects/{projectId}/tasks - should create new task', async () => {
    const response = await request(app)
      .post(`/api/projects/${testProjectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockTask);

    expect(response.status).toBe(201);
    expect(response.body.task.title).toBe(mockTask.title);
    expect(response.body.task.priority).toBe(mockTask.priority);
  });

  test('POST /api/projects/{projectId}/tasks - should validate required fields', async () => {
    const response = await request(app)
      .post(`/api/projects/${testProjectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'No title' });

    expect(response.status).toBe(400);
  });

  test('POST /api/projects/{projectId}/tasks - should return 404 for non-existent project', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .post(`/api/projects/${fakeId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockTask);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Project not found');
  });
});

describe('Task Controller - PUT Operations', () => {
  beforeEach(async () => {
    const task = await Task.create({
      title: mockTask.title,
      description: mockTask.description,
      projectId: testProjectId,
      createdBy: testUserId,
      assignedTo: testUserId,
      priority: mockTask.priority,
    });
    testTaskId = task._id.toString();
  });

  test('PUT /api/tasks/{taskId} - should update task', async () => {
    const updateData = {
      title: 'Updated Task',
      description: 'Updated description',
      priority: 'low',
    };

    const response = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.task.title).toBe(updateData.title);
    expect(response.body.task.priority).toBe(updateData.priority);
  });

  test('PUT /api/tasks/{taskId} - should validate data', async () => {
    const response = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '' });

    expect(response.status).toBe(400);
  });

  test('PATCH /api/tasks/{taskId}/status - should update task status', async () => {
    const response = await request(app)
      .patch(`/api/tasks/${testTaskId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'in-progress' });

    expect(response.status).toBe(200);
    expect(response.body.task.status).toBe('in-progress');
  });

  test('PATCH /api/tasks/{taskId}/status - should validate status enum', async () => {
    const response = await request(app)
      .patch(`/api/tasks/${testTaskId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'invalid-status' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid status');
  });
});

describe('Task Controller - DELETE Operations', () => {
  beforeEach(async () => {
    const task = await Task.create({
      title: mockTask.title,
      description: mockTask.description,
      projectId: testProjectId,
      createdBy: testUserId,
      priority: mockTask.priority,
    });
    testTaskId = task._id.toString();
  });

  test('DELETE /api/tasks/{taskId} - should delete task (owner only)', async () => {
    const response = await request(app)
      .delete(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task deleted successfully');

    const deletedTask = await Task.findById(testTaskId);
    expect(deletedTask).toBeNull();
  });

  test('DELETE /api/tasks/{taskId} - should return 404 for non-existent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/tasks/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found');
  });
});
