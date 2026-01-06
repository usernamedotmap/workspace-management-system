import { title } from "process";
import { taskPriorityEnum } from "../enums/task_priority.enum";
import { taskStatusEnum } from "../enums/task_status.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import WorkSpaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";

export const createTaskService = async (
  projectId: string,
  workspaceId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    assignedTo?: string | null;
    dueDate?: string;
  }
) => {
  const { title, description, status, priority, assignedTo, dueDate } = body;

  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId) {
    throw new NotFoundException("Project not found");
  }

  if (assignedTo) {
    const isAssignedUserMember = await MemberModel.exists({
      userId: assignedTo,
      workspaceId,
    });

    if (!isAssignedUserMember) {
      throw new Error("Assigned user is not member of this workspace");
    }
  }

  const task = new TaskModel({
    title,
    description,
    priority: priority || taskPriorityEnum.MEDIUM,
    status: status || taskStatusEnum.TODO,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
  });

  await task.save();

  return {
    task,
  };
};

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  body: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    assignedTo?: string | null;
    dueDate?: string;
  }
) => {

  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "This project nowhere to be found or u r not part of this workspace"
    );
  }

  const task = await TaskModel.findById(taskId);

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "This task nowhere to be found or u r not part of this project"
    );
  }

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
    },
    {
      new: true,
    }
  );

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  return {
    updatedTask,
  };
};

export const getAllTaskService = async (
  workspaceId: string,
  filters: {
    projectId?: string | undefined;
    status?: string[] | undefined;
    priority?: string[] | undefined;
    assignedTo?: string[] | undefined;
    keyword?: string | undefined;
    dueDate?: string | undefined;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  };

  if (filters.projectId) {
    query.project = filters.projectId;
  }

  if (filters.assignedTo) {
    query.assignedTo = filters.assignedTo;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  const keyword = filters.keyword?.trim();
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { taskCode: { $regex: keyword, $options: "i" } },
    ];
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }

  const { pageNumber, pageSize } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password ")
      .populate("project", "_id emoji name"),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const project = await ProjectModel.findOne({
    workspace: workspaceId,
  });

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "This project nowhere to be found or u r not part of this workspace"
    );
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  }).populate("assignedTo", "_id name profilePicture -password ");

  if (!task) {
    throw new NotFoundException("Task not found");
  }

  return {
    task,
  };
};

export const deleteTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or u r not belong to this workspace"
    );
  }

  return task;
};
