import * as z from "zod";


const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;     //5mb

export const profileSchema = z.any()
    .refine((file) => file instanceof File, "No file provided")
    .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type), "Invalid file type")
    .refine((file) => file.size <= MAX_FILE_SIZE, "File size exceeds 5MB");