const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const { hashPassword } = require('../services/passwordService');
const { generateToken } = require('../services/tokenService');

let app;
let testUserId;
let testProjectId;
let testTaskId;
let testCommentId;
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
};

const mockComment = {
  content: 'This is a test comment',
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
    await Comment.deleteMany({});

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

    const task = await Task.create({
      title: mockTask.title,
      description: mockTask.description,
      projectId: testProjectId,
      createdBy: testUserId,
    });

    testTaskId = task._id.toString();
  } catch (error) {
    console.error('Setup error:', error);
  }
});

afterEach(async () => {
  try {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
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

describe('Comment Controller - GET Operations', () => {
  beforeEach(async () => {
    const comment = await Comment.create({
      content: mockComment.content,
      taskId: testTaskId,
      authorId: testUserId,
    });
    testCommentId = comment._id.toString();
  });

  test('GET /api/tasks/{taskId}/comments - should get all comments on task', async () => {
    const response = await request(app)
      .get(`/api/tasks/${testTaskId}/comments`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.comments).toHaveLength(1);
    expect(response.body.comments[0].content).toBe(mockComment.content);
  });

  test('GET /api/tasks/{taskId}/comments - should return 404 for non-existent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/tasks/${fakeId}/comments`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found');
  });

  test('GET /api/tasks/{taskId}/comments - should return 401 without auth token', async () => {
    const response = await request(app).get(`/api/tasks/${testTaskId}/comments`);

    expect(response.status).toBe(401);
  });
});

describe('Comment Controller - POST Operations', () => {
  test('POST /api/tasks/{taskId}/comments - should create new comment', async () => {
    const response = await request(app)
      .post(`/api/tasks/${testTaskId}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockComment);

    expect(response.status).toBe(201);
    expect(response.body.comment.content).toBe(mockComment.content);
    expect(response.body.message).toBe('Comment created successfully');
  });

  test('POST /api/tasks/{taskId}/comments - should validate required fields', async () => {
    const response = await request(app)
      .post(`/api/tasks/${testTaskId}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: '' });

    expect(response.status).toBe(400);
  });

  test('POST /api/tasks/{taskId}/comments - should return 404 for non-existent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .post(`/api/tasks/${fakeId}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockComment);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found');
  });
});

describe('Comment Controller - PUT Operations', () => {
  beforeEach(async () => {
    const comment = await Comment.create({
      content: mockComment.content,
      taskId: testTaskId,
      authorId: testUserId,
    });
    testCommentId = comment._id.toString();
  });

  test('PUT /api/comments/{commentId} - should update comment (author only)', async () => {
    const updateData = {
      content: 'Updated comment content',
    };

    const response = await request(app)
      .put(`/api/comments/${testCommentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.comment.content).toBe(updateData.content);
  });

  test('PUT /api/comments/{commentId} - should validate required fields', async () => {
    const response = await request(app)
      .put(`/api/comments/${testCommentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: '' });

    expect(response.status).toBe(400);
  });

  test('PUT /api/comments/{commentId} - should return 404 for non-existent comment', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .put(`/api/comments/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Updated' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Comment not found');
  });
});

describe('Comment Controller - DELETE Operations', () => {
  beforeEach(async () => {
    const comment = await Comment.create({
      content: mockComment.content,
      taskId: testTaskId,
      authorId: testUserId,
    });
    testCommentId = comment._id.toString();
  });

  test('DELETE /api/comments/{commentId} - should delete comment (author or owner)', async () => {
    const response = await request(app)
      .delete(`/api/comments/${testCommentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Comment deleted successfully');

    const deletedComment = await Comment.findById(testCommentId);
    expect(deletedComment).toBeNull();
  });

  test('DELETE /api/comments/{commentId} - should return 404 for non-existent comment', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/comments/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Comment not found');
  });

  test('DELETE /api/comments/{commentId} - should return 401 without auth token', async () => {
    const response = await request(app).delete(`/api/comments/${testCommentId}`);

    expect(response.status).toBe(401);
  });
});
