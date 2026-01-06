import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.user , "Hello");
  console.log(req.user?._id, "baby")
  if (!req.user || !req.user._id) {
    throw new UnauthorizedException("Unauthorized. Please login :?");
  }
  next();
};

export default isAuthenticated;
