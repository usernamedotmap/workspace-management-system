import { UserDocument } from "../models/user.model";

declare global {
  namespace Express {
    interface User extends Omit<UserDocument, "password"> {
      _id?: any;
     
    }
    interface Request {
      jwt?: string;
    }
  }
}
