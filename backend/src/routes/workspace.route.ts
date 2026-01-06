import { Router } from "express";
import {
  createWorkspaceController,
  deleteWorkspaceByIdController,
  getAllWorkspaceController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
  getWorkspaceMemberController,
  updateWorkspaceByIdController,
  updateWorkspaceMemberRoleController,
} from "../controllers/workspace.controller";

const workspaceRoutes = Router();

workspaceRoutes.post("/create/new", createWorkspaceController);
workspaceRoutes.put("/update/:id", updateWorkspaceByIdController)
workspaceRoutes.put(
  "/change/member/role/:id",
  updateWorkspaceMemberRoleController
);

workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);

workspaceRoutes.get("/all", getAllWorkspaceController);

workspaceRoutes.get("/member/:id", getWorkspaceMemberController);
workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);
workspaceRoutes.get("/:id", getWorkspaceByIdController);


export default workspaceRoutes;
