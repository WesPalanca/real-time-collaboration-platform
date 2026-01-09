import z from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3).max(10),
    email: z.email(),
    password: z.string().min(6).max(12)

});

export const logInSchema = z.object({
    username: z.string().optional(),
    email: z.email().optional(),
    password: z.string()
}).refine((data) => data.username || data.email, {
    error: "Either username or email required"
})