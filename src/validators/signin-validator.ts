import {z} from "zod"

export const SigninSchema = z.object({
    email : z.string().email(),
    password : z.string()
})

export type SigninFormInputs = z.infer<typeof SigninSchema>;