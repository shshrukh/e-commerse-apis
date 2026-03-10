import { Router } from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { createCategorySchema } from "../schemas/createCategory.js";
import { allowRoles } from "../middlewares/allowRole.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createCategory, editProductDeals, getAllAdminProducts } from "../controllers/porduct.controller.js";
import { editParoductSchama } from "../schemas/editPorductDeal.js";


const adminRoute = Router();

adminRoute.route("/verify-category").post(validateZodSchema(createCategorySchema), authMiddleware,  allowRoles("admin"), createCategory);
adminRoute.route('/products').get(authMiddleware, allowRoles('admin'), getAllAdminProducts);
adminRoute.route('/products/:id/deals').post(validateZodSchema(editParoductSchama),authMiddleware, allowRoles('admin'), editProductDeals);



export {adminRoute}