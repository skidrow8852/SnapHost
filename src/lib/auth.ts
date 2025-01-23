/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import jwt from "jsonwebtoken";
import {v4} from "uuid"

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql", 
    }),

    emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  emailVerification: {
        sendOnSignUp: true
    },
  socialProviders: { 
       github: { 
        clientId: process.env.GITHUB_CLIENT_ID!, 
        clientSecret: process.env.GITHUB_CLIENT_SECRET!, 
        disableRedirect : true,
       }, 
       google : {
           clientId: process.env.GOOGLE_CLIENT_ID!,
           clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
           disableRedirect : true,
       }

       
    }, 
})


export const token = (id : string) =>  jwt.sign(
            {
            id: id,
            jti: v4(),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, 
            },
            process.env.BETTER_AUTH_SECRET!,
        );