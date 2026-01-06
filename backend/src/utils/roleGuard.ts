import { PermissionType } from "../enums/roles.enum";
import { UnauthorizedException } from "./appError";
import { RolePermissions } from "./role_permission";

export const roleGuard = (
  role: keyof typeof RolePermissions,
  requiredPermissions: PermissionType[]
) => {
  const permissions = RolePermissions[role];

  const hasPermissions = requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );

  if (!hasPermissions) {
    throw new UnauthorizedException(
      "You do not have enough persmission to take this action"
    );
  }
};
