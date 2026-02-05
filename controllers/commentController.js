const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Create comment
const createComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);

    // Check authorization
    if (
      project.ownerId.toString() !== req.userId &&
      !project.teamMembers.includes(req.userId)
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to comment on this task' });
    }

    const comment = await Comment.create({
      content,
      taskId,
      authorId: req.userId,
    });

    const populatedComment = await comment.populate(['taskId', 'authorId']);

    // Add comment to task
    task.comments.push(comment._id);
    await task.save();

    res.status(201).json({
      message: 'Comment created successfully',
      comment: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// Get all comments on task
const getCommentsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);

    // Check authorization
    if (
      project.ownerId.toString() !== req.userId &&
      !project.teamMembers.includes(req.userId)
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view comments' });
    }

    const comments = await Comment.find({ taskId }).populate([
      'taskId',
      'authorId',
    ]);

    res.status(200).json({
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// Update comment
const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only author can update
    if (comment.authorId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Only comment author can update' });
    }

    comment.content = content || comment.content;
    await comment.save();

    const updatedComment = await comment.populate(['taskId', 'authorId']);

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// Delete comment
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const task = await Task.findById(comment.taskId);
    const project = await Project.findById(task.projectId);

    // Author or project owner can delete
    if (
      comment.authorId.toString() !== req.userId &&
      project.ownerId.toString() !== req.userId
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);

    // Remove comment from task
    task.comments = task.comments.filter(
      (cid) => cid.toString() !== commentId
    );
    await task.save();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
};
