import * as z from 'zod';

const createProductSchema = z.object({
     name: z.string().trim().min(3, "Product name should have at least 3 characters"),
        price: z.number(),
        stock: z.number(),
        isActive: z.boolean(),
        category: z.string().min(24, "user id must have 24 digits number"),
        deals: z.array(
            z.object({
                user: z.string().min(24, "user id must have 24 characters"),
                discount: z.number().min(0).max(100, "discount must be between 0 and 100"),
                startDate: z.date().optional(),
                endDate: z.date().optional()
            })
        )
});