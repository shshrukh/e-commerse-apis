import * as z from "zod";


export const userLoginSchema = z.object({
    email: z.email(),
    password: z.string().trim().min(8, "Password must be at least 8 characters long")
})