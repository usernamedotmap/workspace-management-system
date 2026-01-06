import { PermissionType, RoleType, Permissions } from "../enums/roles.enum";

export const RolePermissions: Record<RoleType, Array<PermissionType>> = {
  OWNER: Object.values(Permissions),
  ADMIN: [
    Permissions.ADD_MEMBER,

    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.DELETE_PROJECT,
    Permissions.VIEW_PROJECT,

    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.DELETE_TASK,

    Permissions.MANAGE_WORKSPACE_SETTINGS,
    Permissions.VIEW_ONLY,
  ],
  MEMBER: [
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.VIEW_ONLY,
  ],
};
