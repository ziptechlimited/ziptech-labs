import express, { Express, Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";

import authRoutes from "./routes/authRoutes";
import cohortRoutes from "./routes/cohortRoutes";
import goalRoutes from "./routes/goalRoutes";
import checkInRoutes from "./routes/checkInRoutes";
import supportRoutes from "./routes/supportRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import meetingRoutes from "./routes/meetingRoutes";
import messageRoutes from "./routes/messageRoutes";
import publicRoutes from "./routes/publicRoutes";
import userRoutes from "./routes/userRoutes";
import checkInSessionRoutes from "./routes/checkInSessionRoutes";
import inviteCodeRoutes from "./routes/inviteCodeRoutes";

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*" },
});

const cohortPresence: Record<
  string,
  Record<string, { id: string; name: string }>
> = {};

app.set("io", io);
io.on("connection", (socket) => {
  socket.on("join-cohort", (payload: any) => {
    const cohortId = typeof payload === "string" ? payload : payload?.cohortId;
    if (!cohortId) {
      return;
    }
    socket.join(`cohort:${cohortId}`);
    const userId = payload?.userId;
    const name = payload?.name;
    if (userId && name) {
      if (!cohortPresence[cohortId]) {
        cohortPresence[cohortId] = {};
      }
      cohortPresence[cohortId][userId] = { id: String(userId), name };
      (socket.data as any).cohortId = cohortId;
      (socket.data as any).userId = String(userId);
      io.to(`cohort:${cohortId}`).emit("presence", {
        cohortId,
        users: Object.values(cohortPresence[cohortId]),
      });
    }
  });
  socket.on("leave-cohort", (payload: any) => {
    const cohortId = typeof payload === "string" ? payload : payload?.cohortId;
    if (!cohortId) {
      return;
    }
    socket.leave(`cohort:${cohortId}`);
    const userId = (payload && payload.userId) || (socket.data as any).userId;
    if (userId && cohortPresence[cohortId]) {
      delete cohortPresence[cohortId][String(userId)];
      io.to(`cohort:${cohortId}`).emit("presence", {
        cohortId,
        users: Object.values(cohortPresence[cohortId]),
      });
    }
  });
  socket.on("typing", (payload: any) => {
    const cohortId = payload?.cohortId;
    if (!cohortId) {
      return;
    }
    socket.broadcast.to(`cohort:${cohortId}`).emit("typing", {
      cohortId,
      userId: payload.userId,
      name: payload.name,
    });
  });
  socket.on("disconnect", () => {
    const cohortId = (socket.data as any).cohortId;
    const userId = (socket.data as any).userId;
    if (cohortId && userId && cohortPresence[cohortId]) {
      delete cohortPresence[cohortId][String(userId)];
      io.to(`cohort:${cohortId}`).emit("presence", {
        cohortId,
        users: Object.values(cohortPresence[cohortId]),
      });
    }
  });
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Database Connection
mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err: any) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cohorts", cohortRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/checkins", checkInRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/public", publicRoutes);
app.use("/api/users", userRoutes);
app.use("/api/checkin-sessions", checkInSessionRoutes);
app.use("/api/invite-codes", inviteCodeRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Ziptech Labs API Running");
});

// Start Server
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
