import jwt from "jsonwebtoken";
import createError from "http-errors";
import { v4 as uuidv4 } from "uuid";

const {listener} = require("../database/redis");
const redisClient = listener

export async function revokeToken(jti: string) {
  try {
    await redisClient.set(jti, "revoked");
  } catch (error) {
    console.error("Error revoking token:", error.message);
  }
}

export async function verifyUserAccessToken(req: any, res: any, next: any) {
  if (!req.headers["authorization"]) return next(createError.Unauthorized());
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET_USER,
    async (err: any, payload: any) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return res.status(404).json({ msg: message });
      }

      if (Date.now() >= payload.exp * 1000) {
        // Check if token is expired
        return res.status(404).json({ msg: "Token expired" });
      }
      const { jti } = payload;
      if (!jti) {
        return next(
          createError.Unauthorized("Token is invalid (missing `jti`)"),
        );
      }
      const isRevoked = await redisClient.get(jti);
      if (isRevoked) {
        return res.status(401).json({ error: "Token has been revoked" });
      }

      req.payload = payload;
      next();
    },
  );
}


export function createUserToken(_id: string, email: string, passwordVersion: string) {
  const jti = uuidv4();
  return jwt.sign(
    { id: _id, email: email, passwordVersion: passwordVersion, jti },
    process.env.ACCESS_TOKEN_SECRET_USER as string,
    { expiresIn: "30d" },
  );
}