import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { HTTPSTATUS } from "../config/http.config";
import { getCurrentUserService } from "../services/user.service";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.sendStatus(HTTPSTATUS.UNAUTHORIZED);
    }

    const { user } = await getCurrentUserService(req.user._id);
    res.status(HTTPSTATUS.OK).json({
      message: "User fetch successfully",
      user,
    });
  }
);
