import * as z from "zod";


const editParoductSchama = z.object({
    
    discount: z.number().min(0).max(100, "discount must be between 0 and 100"),
    startDate: z.date().optional(),
    endDate: z.date().optional()

})

export { editParoductSchama };