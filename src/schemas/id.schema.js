import * as z from "zod";


const idSchema = z.object({
    id: z.string().min(24, "user id must have 24 characters")
})

export {idSchema}