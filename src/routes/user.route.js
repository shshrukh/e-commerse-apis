import { Router } from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { registerUser, verifyEmail } from "../controllers/user.controller.js";
import { userRegisterSchema } from "../schemas/userRegister.js";



const userRouter = Router();

userRouter.route('/register').post(validateZodSchema(userRegisterSchema), registerUser);
userRouter.route('/verify-email/:token').get( verifyEmail);


export { userRouter }