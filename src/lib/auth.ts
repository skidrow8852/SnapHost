import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
 
export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql", 
    }),
    emailAndPassword: {
    enabled: true,
    autoSignIn: true
  },
  socialProviders: { 
       github: { 
        clientId: process.env.GITHUB_CLIENT_ID!, 
        clientSecret: process.env.GITHUB_CLIENT_SECRET!, 
       }, 
       google : {
           clientId: process.env.GOOGLE_CLIENT_ID!,
           clientSecret: process.env.GOOGLE_CLIENT_SECRET!
       }
    }, 
})