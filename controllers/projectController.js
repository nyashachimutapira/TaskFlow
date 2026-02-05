const Project = require('../models/Project');
const User = require('../models/User');

// Create a new project
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      ownerId: req.userId,
      teamMembers: [req.userId],
    });

    const populatedProject = await project.populate(['ownerId', 'teamMembers']);

    res.status(201).json({
      message: 'Project created successfully',
      project: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// Get all projects for current user
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ ownerId: req.userId }, { teamMembers: req.userId }],
    }).populate(['ownerId', 'teamMembers']);

    res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// Get single project
const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate([
      'ownerId',
      'teamMembers',
    ]);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    if (
      project.ownerId._id.toString() !== req.userId &&
      !project.teamMembers.some(
        (member) => member._id.toString() === req.userId
      )
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to access this project' });
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// Update project
const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can update
    if (project.ownerId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Only project owner can update' });
    }

    project.name = name || project.name;
    project.description = description || project.description;

    await project.save();

    const updatedProject = await project.populate(['ownerId', 'teamMembers']);

    res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete
    if (project.ownerId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Only project owner can delete' });
    }

    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Add team member to project
const addTeamMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can add members
    if (project.ownerId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Only project owner can add members' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    if (project.teamMembers.includes(userId)) {
      return res
        .status(400)
        .json({ message: 'User is already a team member' });
    }

    project.teamMembers.push(userId);
    await project.save();

    const updatedProject = await project.populate(['ownerId', 'teamMembers']);

    res.status(200).json({
      message: 'Team member added successfully',
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// Remove team member from project
const removeTeamMember = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can remove members
    if (project.ownerId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Only project owner can remove members' });
    }

    // Cannot remove owner
    if (project.ownerId.toString() === userId) {
      return res
        .status(400)
        .json({ message: 'Cannot remove project owner' });
    }

    project.teamMembers = project.teamMembers.filter(
      (member) => member.toString() !== userId
    );
    await project.save();

    const updatedProject = await project.populate(['ownerId', 'teamMembers']);

    res.status(200).json({
      message: 'Team member removed successfully',
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
};
