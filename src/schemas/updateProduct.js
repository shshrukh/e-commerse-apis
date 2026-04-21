import * as z from "zod";
import { productSchema } from "./product.js";

export const updateProductSchema = productSchema.partial();
