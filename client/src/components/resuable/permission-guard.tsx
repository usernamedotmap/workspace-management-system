import React from "react";
import { PermissionType } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";

type PermissionsGuardProps = {
  requiredPermission: PermissionType;
  children: React.ReactNode;
  showMessage?: boolean;
};

const PermissionsGuard: React.FC<PermissionsGuardProps> = ({
  requiredPermission, children, showMessage = false,
}) => {
  const { hasPermission } = useAuthContext();

  if (!hasPermission(requiredPermission)) {
    return showMessage && (
      <div className="text-center text-sm pt-3 italic w-full text-muted-foreground">
        You do not have persmissions to access this section.
      </div>
    )
  }

  return <>{children}</>;
};

export default PermissionsGuard;
