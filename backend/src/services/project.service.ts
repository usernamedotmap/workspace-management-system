import mongoose from "mongoose";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { taskStatusEnum } from "../enums/task_status.enum";

export const createProjectService = async (
  userId: string,
  workspaceId: string,
  body: {
    emoji?: string;
    name: string;
    description?: string;
  }
) => {
  const project = new ProjectModel({
    ...(body.emoji && {
      emoji: body.emoji,
    }),
    name: body.name,
    description: body.description,
    workspace: workspaceId,
    createdBy: userId,
  });

  await project.save();

  return { project };
};

export const getProjectsInWorkspaceService = async (
  workspaceId: string,
  pageSize: number,
  pageNumber: number
) => {
  const totalProjects = await ProjectModel.countDocuments({
    workspace: workspaceId,
  });

  const skip = (pageNumber - 1) * pageSize;

  const projects = await ProjectModel.find({
    workspace: workspaceId,
  })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalProjects / pageSize);

  return {
    projects,
    totalProjects,
    totalPages,
    skip,
  };
};

export const getProjectByIdInWorkspaceService = async (
  workspaceId: string,
  projectId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id emoji name description");

  if (!project) {
    throw new NotFoundException(
      "Project not found or this is not your workspace back off"
    );
  }

  return {
    project,
  };
};

export const getProjectAnalyticsService = async (
  projectId: string,
  workspaceId: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      "Project not found or this is not your workspace back off"
    );
  }

  const currentDate = new Date();

  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        overDueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: {
                $ne: taskStatusEnum.DONE,
              },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: { status: "DONE" },
          },
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const analytic = taskAnalytics[0];

  const analytics = {
    totalTasks: analytic.totalTasks[0]?.count || 0,
    overDueTasks: analytic.overDueTasks[0]?.count || 0,
    completedTasks: analytic.completedTasks[0]?.count || 0,
  };

  return {
    analytics,
  };
};

export const updateProjectService = async (
  projectId: string,
  workspaceId: string,
  body: { name: string; emoji?: string; description?: string }
) => {
  const { name, emoji, description } = body;

  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project not found or this is not your workspace back off"
    );
  }

  if (emoji) project.emoji = emoji;
  if (name) project.name = name;
  if (description) project.description = description;

  await project.save();

  return { project };
};

export const deleteProjectService = async (
  projectId: string,
  workspaceId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project not found or this is not your workspace back off"
    );
  }

  await TaskModel.deleteMany({
    project: project._id,
  });

  await project.deleteOne();

  return project;
};
