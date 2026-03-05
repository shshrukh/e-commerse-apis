import * as z from "zod";
import { addressSchema } from "./address.js";


const orderIteamSchema = z.object({
    product: z.string().min(1, "product ID is required"),
    name: z.string().min(1, "product name is required"),
    price: z.number().min(0, "product must be grater and equal to zero"),
    quantity: z.number().min(0 ," product min must be grater or equal to zero")
});

export const createOrderSchema = z.object({
    user: z.string().min(1, "Order must have at least one iteam"),
    iteam: z.array(orderIteamSchema),
    totalAmount: z.number().min(0, "Total amount must be grater then or equal to zero"),
    addressSnapshort: addressSchema,
    orderStatus: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
    paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
    

})