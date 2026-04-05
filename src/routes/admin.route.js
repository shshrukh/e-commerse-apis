import { Router } from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { createCategorySchema } from "../schemas/createCategory.js";
import { allowRoles } from "../middlewares/allowRole.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createProduct, deleteProduct, editProduct, getAllAdminProducts, getProduct } from "../controllers/product.controller.js";
import { getCategory, deleteCategory, createCategory, editCategory } from "../controllers/category.controller.js"
import { createDeal, deleteDeal, getDeal, editDeals } from "../controllers/deal.controller.js"
import { productDealSchema } from "../schemas/editPorductDeal.js";
import { productSchema } from "../schemas/product.js";
import { imageMulter } from "../middlewares/multerImage.middleware.js";
import { parsedData } from "../middlewares/dataParse.js";



const adminRoute = Router();

const uploadImages = imageMulter(5, ["image/png" , "image/jpeg" , "image/gif", "image/jpg"]);

adminRoute.use(authMiddleware, allowRoles("admin"));
//products
adminRoute.route('/products')
    .get( getAllAdminProducts )
    .post( uploadImages.array("images", 3),parsedData ,validateZodSchema(productSchema),createProduct);

adminRoute.route('/products/:productId')
    .get( getProduct )
    .patch( validateZodSchema(productSchema), editProduct )
    .delete( deleteProduct );

//category
adminRoute.route("/categories").post( validateZodSchema(createCategorySchema), createCategory );

adminRoute.route('/categories/:categoryId')
    .patch( validateZodSchema(createCategorySchema), editCategory )
    .delete( deleteCategory )
    .get( getCategory );

//Deals
adminRoute.route('/products/:productId/deals').post( validateZodSchema(productDealSchema), createDeal );

adminRoute.route('/products/:productId/deals/:dealId')
    .patch( validateZodSchema(productDealSchema), editDeals )
    .delete( deleteDeal )
    .get( getDeal );



export { adminRoute }