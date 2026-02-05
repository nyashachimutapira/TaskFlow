const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateProjectCreate,
  validateInput,
} = require('../middleware/validation');

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post(
  '/',
  authMiddleware,
  validateProjectCreate,
  validateInput,
  projectController.createProject
);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects for current user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/', authMiddleware, projectController.getAllProjects);

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Get single project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 */
router.get('/:projectId', authMiddleware, projectController.getProjectById);

/**
 * @swagger
 * /projects/{projectId}:
 *   put:
 *     summary: Update project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 */
router.put('/:projectId', authMiddleware, projectController.updateProject);

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     summary: Delete project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted
 */
router.delete('/:projectId', authMiddleware, projectController.deleteProject);

/**
 * @swagger
 * /projects/{projectId}/members:
 *   post:
 *     summary: Add team member (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team member added
 */
router.post(
  '/:projectId/members',
  authMiddleware,
  projectController.addTeamMember
);

/**
 * @swagger
 * /projects/{projectId}/members/{userId}:
 *   delete:
 *     summary: Remove team member (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member removed
 */
router.delete(
  '/:projectId/members/:userId',
  authMiddleware,
  projectController.removeTeamMember
);

module.exports = router;
