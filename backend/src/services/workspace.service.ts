import mongoose from "mongoose";
import { Roles } from "../enums/roles.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles_permisson.model";
import UserModel from "../models/user.model";
import WorkSpaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import TaskModel from "../models/task.model";
import { taskStatusEnum } from "../enums/task_status.enum";
import ProjectModel from "../models/project.model";

export const createWorkspaceService = async (
  userId: string,
  body: {
    name: string;
    description?: string | undefined;
  },
) => {
  const { name, description } = body;

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
  if (!ownerRole) {
    throw new NotFoundException("Owner role not found");
  }

  const workspace = new WorkSpaceModel({
    name: name,
    description: description,
    owner: user._id,
  });

  await workspace.save();

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });

  await member.save();

  user.currentWorkSpace = workspace._id as mongoose.Types.ObjectId;
  await user.save();
  return { workspace };
};

export const getAllUserWorkspaceService = async (userId: string) => {
  const member = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .lean()
    .exec();

  const workspaces = member.map((membership) => membership.workspaceId);

  return {
    workspaces,
  };
};

export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkSpaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Worksapce not found");
  }

  const members = await MemberModel.find({
    workspaceId,
  }).populate("role");

  const workSpaceWithMember = {
    ...workspace.toObject(),
    members,
  };

  return {
    workspace: workSpaceWithMember,
  };
};

export const getWorkspaceMemberService = async (workspaceId: string) => {
  const members = await MemberModel.find({
    workspaceId,
  })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name")
    .lean();

  const roles = await RoleModel.find({}, { name: 1, _id: 1 })
    .select("-permissions")
    .lean();

  return {
    members,
    roles,
  };
};

export const getWorkspaceAnalyticsServices = async (workspaceId: string) => {
  const currentDate = new Date();

  const totalTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
  });

  const overdueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: taskStatusEnum.DONE },
  });

  const completedTask = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: taskStatusEnum.DONE,
  });

  const analytics = {
    totalTasks,
    overdueTasks,
    completedTask,
  };

  return {
    analytics,
  };
};

export const changeMemberRoleService = async (
  workspaceId: string,
  memberId: string,
  roleId: string,
) => {
  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new NotFoundException("Role not found");
  }

  const member = await MemberModel.findOne({
    userId: memberId,
    workspaceId: workspaceId,
  });

  if (!member) {
    throw new NotFoundException("Member not found in this workspace");
  }

  member.role = role;
  await member.save();

  return {
    member,
  };
};

export const updateWorkspaceByIdService = async (
  workspaceId: string,
  name: string,
  description?: string,
) => {
  const workspace = await WorkSpaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;

  await workspace.save();

  return {
    workspace,
  };
};

export const deleteWorkspaceByIdService = async (
  workspaceId: string,
  userId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace =
      await WorkSpaceModel.findById(workspaceId).session(session);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    if (workspace.owner.toString() !== userId.toString()) {
      throw new BadRequestException(
        "You are not authorized to delete this workspace",
      );
    }

    // if (!workspace.owner.equals(userId)) {
    //   throw new BadRequestException(
    //     "You are not authorized to delete this workspace"
    //   );
    // }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await ProjectModel.deleteMany({
      workspace: workspace._id,
    }).session(session);

    await TaskModel.deleteMany({
      workspace: workspace._id,
    }).session(session);

    await MemberModel.deleteMany({
      workspaceId: workspace._id,
    }).session(session);

    if (user?.currentWorkSpace?.equals(workspaceId)) {
      const memberWorkspace = await MemberModel.findOne({
        userId,
      }).session(session);
      user.currentWorkSpace = memberWorkspace
        ? memberWorkspace.workspaceId
        : null;
      await user.save({ session });
    }

    await workspace.deleteOne({ session });

    await session.commitTransaction();

    session.endSession();

    return {
      curretnWorkspace: user.currentWorkSpace,
    };
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw error;
  }
};
