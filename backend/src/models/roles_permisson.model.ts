import mongoose, { Document, Schema } from "mongoose";
import {
  Permissions,
  PermissionType,
  Roles,
  RoleType,
} from "../enums/roles.enum";
import { RolePermissions } from "../utils/role_permission";

export interface RolesDocument extends Document {
  name: RoleType;
  permissions: Array<PermissionType>;
}

const roleSchema = new Schema<RolesDocument>(
  {
    name: {
      type: String,
      enum: Object.values(Roles),
      required: true,
      unique: true,
    },
    permissions: {
      type: [String],
      enum: Object.values(Permissions),
      required: true,
      default: function (this: RolesDocument) {
        return RolePermissions[this.name];
      },
    },
  },
  {
    timestamps: true,
  }
);

const RoleModel = mongoose.model<RolesDocument>("Role", roleSchema);
export default RoleModel;
