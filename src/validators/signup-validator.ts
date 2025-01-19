import {z} from "zod"

export const SignupSchema = z.object({
    name : z.string(),
    email : z.string().email(),
    password : z.string().min(8)
})
export type SignupFormInputs = z.infer<typeof SignupSchema>;