import jwt, { SignOptions } from "jsonwebtoken";
import { UserDocument } from "../models/user.model";
import { config } from "../config/app.config";

export type AccessTPayload = {
  userId: UserDocument["_id"];
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
};

const defaults: SignOptions = {
  audience: ["user"],
};

export const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  secret: config.JWT_SECRET,
};


export const refreshAccessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  secret: config.JWT_REFRESH_SECRET,
};

export const signJwtToken = (
  payload: AccessTPayload,
  options?: SignOptsAndSecret
) => {
  const { secret, ...opts } = options || accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  } as SignOptions);
};

export const signRefreshToken = (payload: AccessTPayload) => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    ...defaults,
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
};
