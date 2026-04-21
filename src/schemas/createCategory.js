import * as z from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(3, "category should have at least three characters"),
    slug: z.string().min(1, "Slug is required").regex( /^[a-z0-9]+(?:-[a-z0-9]+)*$/ , "Slug can only contain lowercase letters, numbers, and single hyphens"),
    
});
