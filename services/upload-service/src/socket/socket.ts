import { Server, Socket } from "socket.io";
import { verify } from "jsonwebtoken";
const ioRedis = require("socket.io-redis");
import dotenv from "dotenv";
dotenv.config();
interface OnlineUsers {
  [key: string]: string;
}

let io: Server;
let connectedSockets: { [key: string]: Socket[] } = {};
let connectedSocketsIds: { [key: string]: string[] } = {};
let onlineUsers: OnlineUsers = {};

module.exports = {
  init: (httpServer: any) => {
    io = new Server(httpServer, {
      cors: {
        origin: `${process.env.URL_FRONTEND_ACCESS}`,
      },
      transports: ["websocket","polling"],
      adapter: ioRedis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      }),
    });

    io.use(async (socket: Socket, next: any) => {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const result = await verifyToken(token);
      if (result.valid) {
        // User/Admin is verified
        (socket as any).userId = result.id;
        storeSocketId(result.id, socket.id, socket);
        return next();
      } else {
        return next(new Error("Authentication failed: " + result.reason));
      }
    });

    io.on("connection", (socket: any) => {

      socket.on("disconnect", () => {
        handleDisconnect(socket);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  },

  getOnlineUsers: () => onlineUsers,
  getConnectedSocketIds: () => connectedSocketsIds,
};


// Function to verify JWT tokens and check user/admin details
async function verifyToken(token: string) {
  try {
    let decoded;


      decoded = verify(token, process.env.ACCESS_TOKEN_SECRET_USER);
      return { valid: true, id: decoded.id.toLowerCase() };
    
  } catch (error) {
    console.error("Token verification error:", error.message);
  }

  return { valid: false, reason: "Invalid token" };
}


// Handle user disconnect
function handleDisconnect(socket: any) {
  const userId = socket.userId;
  // Remove socket ID from connectedSocketsIds for the corresponding userId

  if (
    connectedSocketsIds[userId] &&
    Array.isArray(connectedSocketsIds[userId])
  ) {
    connectedSocketsIds[userId] = connectedSocketsIds[userId].filter(
      (id) => id !== socket.id,
    );

    // If no more connected socket IDs, delete the user from the object

    if (connectedSocketsIds[userId].length === 0) {
      delete connectedSocketsIds[userId];
    }
  }
}

// Store the socket ID in the respective online user's or admin's list
function storeSocketId(
  userId: string,
  socketId: string,
  socket: Socket,
) {
  if (!connectedSockets[userId]) {
    connectedSockets[userId] = [];
  }

  if (!connectedSocketsIds[userId]) {
    connectedSocketsIds[userId] = [];
  }

  connectedSockets[userId].push(socket);
  if (!connectedSocketsIds[userId]?.includes(socketId)) {
    connectedSocketsIds[userId].push(socket.id);
  }
  
    onlineUsers[userId] = socketId; 
}
