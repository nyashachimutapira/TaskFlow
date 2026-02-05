const Task = require('../models/Task');
const Project = require('../models/Project');

// Create task
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority, dueDate } = req.body;

    // Check if project exists and user is authorized
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (
      project.ownerId.toString() !== req.userId &&
      !project.teamMembers.includes(req.userId)
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to create task in this project' });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      priority,
      dueDate,
      createdBy: req.userId,
    });

    const populatedTask = await task.populate([
      'projectId',
      'assignedTo',
      'createdBy',
    ]);

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// Get all tasks in project
const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (
      project.ownerId.toString() !== req.userId &&
      !project.teamMembers.includes(req.userId)
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view tasks' });
    }

    const tasks = await Task.find({ projectId }).populate([
      'projectId',
      'assignedTo',
      'createdBy',
      'comments',
    ]);

    res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Get single task
const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId).populate([
      'projectId',
      'assignedTo',
      'createdBy',
      'comments',
    ]);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    const project = await Project.findById(task.projectId);
    if (
      project.ownerId.toString() !== req.userId &&
      !project.teamMembers.includes(req.userId)
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view this task' });
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// Update task
const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, dueDate } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);

    // Check authorization: assigned user or project owner
    if (
      task.assignedTo?.toString() !== req.userId &&
      project.ownerId.toString() !== req.userId
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this task' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;

    await task.save();

    const updatedTask = await task.populate([
      'projectId',
      'assignedTo',
      'createdBy',
      'comments',
    ]);

    res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// Delete task
const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);

    // Only project owner can delete
    if (project.ownerId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Only project owner can delete tasks' });
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update task status
const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!['to-do', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);

    // Check authorization
    if (
      task.assignedTo?.toString() !== req.userId &&
      project.ownerId.toString() !== req.userId
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update task status' });
    }

    task.status = status;
    await task.save();

    const updatedTask = await task.populate([
      'projectId',
      'assignedTo',
      'createdBy',
      'comments',
    ]);

    res.status(200).json({
      message: 'Task status updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// Assign task to user
const assignTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { assignedTo } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);

    // Only project owner can assign
    if (project.ownerId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Only project owner can assign tasks' });
    }

    // Check if assignedTo user is a team member
    if (assignedTo && !project.teamMembers.includes(assignedTo)) {
      return res
        .status(400)
        .json({ message: 'User is not a team member' });
    }

    task.assignedTo = assignedTo || null;
    await task.save();

    const updatedTask = await task.populate([
      'projectId',
      'assignedTo',
      'createdBy',
      'comments',
    ]);

    res.status(200).json({
      message: 'Task assigned successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
};
