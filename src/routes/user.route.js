import { Router } from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { addProfile, currentUser, registerUser, verifyEmail } from "../controllers/user.controller.js";
import { userRegisterSchema } from "../schemas/userRegister.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { imageMulter} from "../middlewares/multerImage.middleware.js";

const userRouter = Router();

const uploadImage = imageMulter(5, ["image/png" , "image/jpeg" , "image/gif", "image/jpg"]);

userRouter.route('/register').post(validateZodSchema(userRegisterSchema), registerUser);
userRouter.route('/verify-email/:token').get( verifyEmail);
userRouter.route('/add-profile').post(authMiddleware ,uploadImage.single("image"), addProfile);
userRouter.route('/get-user').get(authMiddleware, currentUser)


export { userRouter }