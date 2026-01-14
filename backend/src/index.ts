import "dotenv/config";
import express from "express";
import session from "cookie-session";
import cors from "cors";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler";
// import { BadRequestException } from "./utils/appError";
// import { ErrorCodeEnum } from "./enums/error_code";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import { passportAuthenticateJWT } from "./config/passport.config";

const app = express();
const BASE_PATH = config.BASE_PATH;
const ORIGIN = config.FRONTEND_ORIGIN;
const PORT = config.PORT;

console.log("BASE_PATH:", BASE_PATH);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
  })
);

app.use(passport.initialize());
// app.use(passport.session());

app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
    methods: ["POST", "GET", "PUT", "DELETE"],
  })
);

// app.get(
//   `${BASE_PATH}/test`,
//   asyncHandler(async (req: express.Request, res: express.Response) => {
//     throw new BadRequestException(
//       "This is bed request",
//       ErrorCodeEnum.AUTH_INVALID_TOKEN
//     );
//     return res.status(HTTPSTATUS.OK).json({
//       message: "Helo",
//     });
//   })
// );

// auhhentication
app.use(`${BASE_PATH}/auth`, authRoutes);

// user
app.use(`${BASE_PATH}/user`, passportAuthenticateJWT, userRoutes);

// wokrspce
app.use(`${BASE_PATH}/workspace`, passportAuthenticateJWT, workspaceRoutes);

// member
app.use(`${BASE_PATH}/member`, passportAuthenticateJWT, memberRoutes);

// project
app.use(`${BASE_PATH}/project`, passportAuthenticateJWT, projectRoutes);

// task
app.use(`${BASE_PATH}/task`, passportAuthenticateJWT, taskRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server listening to port ${PORT} in ${config.NODE_ENV} ${BASE_PATH}`);
  await connectDatabase();
});
