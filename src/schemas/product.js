import * as z from "zod";
import { productDealSchema } from "./editPorductDeal.js";

const imageFileSchema = z.custom((file) => {
  // Check if file exists and is an image
  return file && file.mimetype && file.mimetype.startsWith("image/");
}, {
  message: "Invalid file type. Must be an image.",
});

export const productSchema = z.object({
    name: z.string().trim().min(3, "Product name should have at least 3 characters"),
    price: z.number(),
    stock: z.number(),
    isActive: z.boolean(),
    category: z.string().min(24, "user id must have 24 digits number"),
    discription: z.string().min(3, "discription have min three characters").max(200,"discription have max two hundred characters"),
    deals: productDealSchema.optional(),
    Images: z.array(imageFileSchema)
        .min(3, "At least three images are required")
        .max(3, "Max three images are required")
})

