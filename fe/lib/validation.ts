import * as z from "zod";
export const SignInSchema = z.object({
    username: z.string(),
    password: z.string().min(6),
});
