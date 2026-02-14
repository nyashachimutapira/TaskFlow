const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateCommentCreate,
  validateCommentUpdate,
  validateInput,
} = require('../middleware/validation');

/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   post:
 *     summary: Add comment to task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
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
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
router.post(
  '/:taskId/comments',
  authMiddleware,
  validateCommentCreate,
  validateInput,
  commentController.createComment
);

/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   get:
 *     summary: Get all comments on task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/:taskId/comments', authMiddleware, commentController.getCommentsByTask);

/**
 * @swagger
 * /comments/{commentId}:
 *   put:
 *     summary: Update comment (author only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 */
router.put(
  '/comments/:commentId',
  authMiddleware,
  validateCommentUpdate,
  validateInput,
  commentController.updateComment
);

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete comment (author or owner)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete('/comments/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;
