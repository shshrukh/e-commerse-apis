import {Router} from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { userLoginSchema } from "../schemas/userLogin.js";
import { loginUser } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.route('/login').post(validateZodSchema(userLoginSchema), loginUser);

export {authRouter}