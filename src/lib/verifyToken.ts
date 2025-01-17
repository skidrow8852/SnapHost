/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getToken } from "next-auth/jwt";
import { type NextApiResponse } from "next";

export default async function verifyToken(req: any, res: NextApiResponse, next: () => void) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (token.exp && token.exp < currentTime) {
    return res.status(401).json({ error: "Session expired" });
  }

  req.user = token; 
  next();
}