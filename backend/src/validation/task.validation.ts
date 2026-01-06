import { z } from "zod";
import { taskPriorityEnum } from "../enums/task_priority.enum";
import { taskStatusEnum } from "../enums/task_status.enum";

export const taskIdSchema = z.string().trim().min(2).max(255);

export const taskTitleSchema = z.string().trim().min(2).max(255);
export const taskDescriptionSchema = z
  .string()
  .trim()
  .optional();

export const taskPrioritySchema = z.enum(
  Object.values(taskPriorityEnum) as [string, ...string[]]
);

export const taskStatusSchema = z.enum(
  Object.values(taskStatusEnum) as [string, ...string[]]
);

export const assignedToSchema = z.string().trim().min(1).nullable().optional();

export const dueDateSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      return !val || !isNaN(Date.parse(val));
    },
    {
      message: "Invalid Date Format. Please provide the proper date",
    }
  );

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  assignedTo: assignedToSchema,
  dueDate: dueDateSchema
});

export const updateTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  assignedTo: assignedToSchema,
  dueDate: dueDateSchema

});
