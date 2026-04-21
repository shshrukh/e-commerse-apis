import { Router } from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { addProfile, currentUser, registerUser, verifyEmail, userDetails, changePassword } from "../controllers/user.controller.js";
import { userRegisterSchema } from "../schemas/userRegister.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { imageMulter } from "../middlewares/multerImage.middleware.js";
import { getProductsByNameOrSlug } from "../controllers/product.controller.js";
import { getProduct } from "../controllers/product.controller.js";
import { userDetailsSchema } from "../schemas/userdetails.js";
const userRouter = Router();

const uploadImage = imageMulter(5, ["image/png", "image/jpeg", "image/gif", "image/jpg"]);

userRouter.route('/register').post(validateZodSchema(userRegisterSchema), registerUser);
userRouter.route('/verify-email/:token').get(verifyEmail);
userRouter.route('/add-profile').post(authMiddleware, uploadImage.single("image"), addProfile);
userRouter.route('/get-user').get(authMiddleware, currentUser);
userRouter.route('/products').get(getProductsByNameOrSlug);
userRouter.route('/productss/:productId').get(authMiddleware, getProduct);
userRouter.route('/details').post(authMiddleware, validateZodSchema(userDetailsSchema), userDetails);
userRouter.route('/change-password').post(authMiddleware, changePassword);
userRouter.route('/add-profile').put(authMiddleware, uploadImage.single("image"), addProfile)




export { userRouter }