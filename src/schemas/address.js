import * as z from "zod";


export const addressSchema = z.object({
    city: z.string().trim().min(2, "City must be at least 2 characters"),
    country: z.string().trim().min(2, "Country must be at least 2 characters"),
    zip: z.number().int("ZIP must be a number")
})


