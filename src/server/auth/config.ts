import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/server/db";
import { v4 as uuidv4 } from "uuid"; 

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

}


export const authConfig = {
  providers: [
    GithubProvider,
    GoogleProvider
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.jti = uuidv4(); 
        token.email = user.email;
        token.id = user.id; 
      }
      return token;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
