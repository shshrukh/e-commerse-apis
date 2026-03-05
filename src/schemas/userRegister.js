import * as z from "zod";
import { addressSchema } from "./address.js";


const userRegisterSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long"),
    email: z.email("Please provide a valid email address").trim(),
    password: z.string().min(8, "Password must be at least eight characters long"),
    contactNumber: z.string().trim(),
    addresses: z.array(addressSchema).min(1,"one field is required")
})

export { userRegisterSchema }