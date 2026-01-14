import { Response, Request, NextFunction } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { config } from "../config/app.config";
import { registerSchema } from "../validation/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import {
  registerUserService,
  verifyUserService,
} from "../services/auth.service";
import jwt from "jsonwebtoken";
import passport from "passport";
import { signJwtToken, signRefreshToken } from "../utils/jwt";
import { getClearCookieOptions, getCookieOptions } from "../utils/cookieOpt";


export const googleLoginCallBack = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const currentWorkSpace = req.user?.currentWorkSpace;

    if (!user) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }

    const accessToken = signJwtToken({ userId: user._id });
    const refreshToken = signRefreshToken({ userId: user._id });

    // ✅ store in cookies na to
    res.cookie("accessToken", accessToken, getCookieOptions());
    res.cookie("refreshToken", refreshToken, getCookieOptions());
      

 
  

    return res.redirect(
      `${config.FRONTEND_ORIGIN}/workspace/${currentWorkSpace || ""}`
    );
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
    });
  }
);

export const loginUserController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }

        const accessToken = signJwtToken({ userId: user._id });
        const refreshToken = signRefreshToken({ userId: user._id });

        res.cookie("accessToken", accessToken, getCookieOptions());
        res.cookie("refreshToken", refreshToken, {
          ...getCookieOptions(),
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(HTTPSTATUS.OK).json({
          message: "Logged in successfully",
          user,
        });
      }
    )(req, res, next);
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    req.logOut((err) => {
      if (err) {
        console.log("error: ", err);
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
          error: "Failed to log out",
        });
      }
    });

    res.clearCookie("accessToken", getClearCookieOptions());
    res.clearCookie("refreshToken", getClearCookieOptions());
    return res.status(HTTPSTATUS.OK).json({
      message: "Successfully logged out",
    });
  }
);

export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.sendStatus(HTTPSTATUS.UNAUTHORIZED);

    let payload: { userId: string };

    try {
      payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
        userId: string;
      };
    } catch (error) {
      res.clearCookie("accessToken", getClearCookieOptions());
      res.clearCookie("refreshToken", getClearCookieOptions());
      return res.sendStatus(HTTPSTATUS.UNAUTHORIZED);
    }

    const newAccessToken = signJwtToken({ userId: payload.userId });

    res.cookie("accessToken", newAccessToken, getCookieOptions());

    res.status(HTTPSTATUS.OK).json({
      accessToken: newAccessToken,
    });
  }
);
