import * as z from "zod";

const productDealSchema = z
    .object({
        discount: z
            .number()
            .min(0, "Discount cannot be negative")
            .max(100, "Discount must be between 0 and 100"),

        startDate: z.coerce.date().optional(),

        endDate: z.coerce.date()
    })
    .superRefine((data, ctx) => {
        const start = data.startDate ?? new Date();
        const end = data.endDate;

        if (data.startDate && start < new Date()) {
            ctx.addIssue({
                path: ["startDate"],
                code: "custom",
                message: "Start date cannot be in the past"
            });
        }

        if (end <= start) {
            ctx.addIssue({
                path: ["endDate"],
                code: "custom",
                message: "End date must be after start date"
            });
        }

        const oneYear = 365 * 24 * 60 * 60 * 1000;

        if (end.getTime() - start.getTime() > oneYear) {
            ctx.addIssue({
                path: ["endDate"],
                code: "custom",
                message: "Deal cannot exceed 1 year"
            });
        }
    });

export { productDealSchema };