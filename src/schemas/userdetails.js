import * as z from "zod";

const userDetailsSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    contactNumber: z.string().regex(/^\+923\d{9}$/, "Enter a valid number like +923XXXXXXXXX"),
    city: z.string().min(3, "City must be at least 3 characters long"),
    country: z.string().min(3, "Country must be at least 3 characters long"),
    zip: z.number().min(5, "Zip code must be at least 5 digits long")
});

export { userDetailsSchema };