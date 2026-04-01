import * as z from "zod";
import { productDealSchema } from "./editPorductDeal.js";


export const productSchema = z.object({
    name: z.string().trim().min(3, "Product name should have at least 3 characters"),
    price: z.number(),
    stock: z.number(),
    isActive: z.boolean(),
    category: z.string().min(24, "user id must have 24 digits number"),
    deals: productDealSchema.optional()
})