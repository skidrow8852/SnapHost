/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/server/db";
import { v4 as uuidv4 } from "uuid";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string | undefined ;
    isPro: boolean;
    email?: string | null ;
  }

  interface JWT {
    id: string;
    email: string;
    isPro: boolean;
    jti: string;
    exp: number;
  }
}

export const authConfig = {
  // Authentication Providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  adapter: PrismaAdapter(db),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
    updateAge: 24 * 60 * 60,
  },

  callbacks: {
    // Add custom fields to the session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isPro = token.isPro || false;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.jti = uuidv4(); 
        token.id = user.id;
        token.email = user.email;
        token.isPro = user.isPro || false;
        token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; 
      }

      return token;
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,

  debug: process.env.NODE_ENV === "development",
};
