import passport from "passport";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import { config } from "./app.config";
import { NotFoundException } from "../utils/appError";
import { ProviderEnum } from "../enums/account_provider.enum";
import {
  findUserIdService,
  loginOrCreateAccountService,
  verifyUserService,
} from "../services/auth.service";
import { signJwtToken, signRefreshToken } from "../utils/jwt";
import { HTTPSTATUS } from "./http.config";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (req: Request, _accessToken, _refreshToken, profile, done) => {
      try {
        const { email, sub: googleId, picture } = profile._json;

        if (!googleId) {
          throw new NotFoundException("Google ID (sub) is missing");
        }

        const { user } = await loginOrCreateAccountService({
          provider: ProviderEnum.GOOGLE,
          displayName: profile.displayName,
          providerId: googleId,
          picture: picture,
          email: email,
        });

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = await verifyUserService({ email, password });
        return done(null, user);
      } catch (error: any) {
        return done(error, false, {
          message: error.message,
        });
      }
    }
  )
);



export const passportAuthenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.session?.accessToken;

    if (!accessToken) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    }


    const payload = jwt.verify(accessToken, config.JWT_SECRET) as { userId: string };

    const user = await findUserIdService(payload.userId);

    if (!user) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "Access token expired" });
    }

    return res
      .status(HTTPSTATUS.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }
};
