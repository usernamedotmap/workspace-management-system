import { CookieOptions } from "express";
import { config } from "../config/app.config";

export const getCookieOptions = (): CookieOptions =>
  ({
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
  } as const);

export const getClearCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: config.NODE_ENV === "production" ? "none" : "lax",
});
