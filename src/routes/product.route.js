import { Router } from "express";
import { getAllProducts } from "../controllers/product.controller.js";


const productRoute = Router();

productRoute.route('/all-products').get(getAllProducts)




export {productRoute}