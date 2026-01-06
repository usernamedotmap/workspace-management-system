import { z } from "zod";

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Name is required" })
  .max(255);
export const descriptonSchema = z.string().trim().optional();

export const workspaceIdSchema = z
  .string()
  .trim()
  .min(1, { message: "Workspace ID is required" });

export const changeRoleSchema = z.object({
  roleId: z.string().trim().min(1),
  memberId: z.string().trim().min(1, "Member ID is required"),
});

export const createWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptonSchema,
});

export const updateWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptonSchema,
});
