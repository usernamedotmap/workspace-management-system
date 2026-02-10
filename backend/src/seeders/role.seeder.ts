import "dotenv/config";
import mongoose from "mongoose";
import RoleModel from "../models/roles_permisson.model";
import { RolePermissions } from "../utils/role_permission";
import connectDatabase from "../config/database.config";

const seedRoles = async () => {
  console.log("Seeding roles started...");

  try {

    await connectDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("Clearing existing roles...");

    await RoleModel.deleteMany({}, { session });

    for (const roleName in RolePermissions) {
      const role = roleName as keyof typeof RolePermissions;
    const permissions = RolePermissions[role];
      const existingRole = await RoleModel.findOne({
        name: role,
      }).session(session);

      if (!existingRole) {
        const newRole = new RoleModel({
          name: role,
          permissions: permissions,
        });
        await newRole.save({ session });
        console.log(`Role ${role} added with permission.`);
      }
    }

    await session.commitTransaction();
    console.log("Transaction comited")

    session.endSession()
    console.log("sessio ended")
  } catch (error) {
    console.log("Failed to seed", error);
  }
};

seedRoles().catch((errr) => console.log("Error running script", errr));
