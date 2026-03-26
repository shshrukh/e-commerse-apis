import { Router } from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { createCategorySchema } from "../schemas/createCategory.js";
import { allowRoles } from "../middlewares/allowRole.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createCategory, createDeal, deleteCategory, deleteDeal, deleteProduct, editCategory, editDeals, editProduct, getAllAdminProducts } from "../controllers/porduct.controller.js";
import { productDealSchema } from "../schemas/editPorductDeal.js";
import { productSchema } from "../schemas/product.js";


const adminRoute = Router();

adminRoute.route("/verify-category").post(validateZodSchema(createCategorySchema), authMiddleware,  allowRoles("admin"), createCategory);
adminRoute.route('/edit-category/:id').patch(validateZodSchema(createCategorySchema), authMiddleware, allowRoles("admin"), editCategory);
adminRoute.route('/delete-category/:id').delete(authMiddleware, allowRoles("admin"), deleteCategory);
adminRoute.route('/products').get(authMiddleware, allowRoles('admin'), getAllAdminProducts);
adminRoute.route('/delete-product/:id').delete(authMiddleware, allowRoles('admin'),deleteProduct);
adminRoute.route('/edit-product/:id').patch(validateZodSchema(productSchema),authMiddleware, allowRoles('admin'), editProduct);
adminRoute.route('/products/:id/deals').post(validateZodSchema(productDealSchema),authMiddleware, allowRoles('admin'), createDeal);
adminRoute.route('/edit-product/:id').post(validateZodSchema(productDealSchema), authMiddleware,allowRoles('admin'), editDeals ); 
adminRoute.route('/delete-deals/:id').delete(authMiddleware, allowRoles("admin"), deleteDeal)



export {adminRoute}