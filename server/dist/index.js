"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cohortRoutes_1 = __importDefault(require("./routes/cohortRoutes"));
const goalRoutes_1 = __importDefault(require("./routes/goalRoutes"));
const checkInRoutes_1 = __importDefault(require("./routes/checkInRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/supportRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const meetingRoutes_1 = __importDefault(require("./routes/meetingRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const checkInSessionRoutes_1 = __importDefault(require("./routes/checkInSessionRoutes"));
const inviteCodeRoutes_1 = __importDefault(require("./routes/inviteCodeRoutes"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*" },
});
const cohortPresence = {};
app.set("io", io);
io.on("connection", (socket) => {
    socket.on("join-cohort", (payload) => {
        const cohortId = typeof payload === "string" ? payload : payload === null || payload === void 0 ? void 0 : payload.cohortId;
        if (!cohortId) {
            return;
        }
        socket.join(`cohort:${cohortId}`);
        const userId = payload === null || payload === void 0 ? void 0 : payload.userId;
        const name = payload === null || payload === void 0 ? void 0 : payload.name;
        if (userId && name) {
            if (!cohortPresence[cohortId]) {
                cohortPresence[cohortId] = {};
            }
            cohortPresence[cohortId][userId] = { id: String(userId), name };
            socket.data.cohortId = cohortId;
            socket.data.userId = String(userId);
            io.to(`cohort:${cohortId}`).emit("presence", {
                cohortId,
                users: Object.values(cohortPresence[cohortId]),
            });
        }
    });
    socket.on("leave-cohort", (payload) => {
        const cohortId = typeof payload === "string" ? payload : payload === null || payload === void 0 ? void 0 : payload.cohortId;
        if (!cohortId) {
            return;
        }
        socket.leave(`cohort:${cohortId}`);
        const userId = (payload && payload.userId) || socket.data.userId;
        if (userId && cohortPresence[cohortId]) {
            delete cohortPresence[cohortId][String(userId)];
            io.to(`cohort:${cohortId}`).emit("presence", {
                cohortId,
                users: Object.values(cohortPresence[cohortId]),
            });
        }
    });
    socket.on("typing", (payload) => {
        const cohortId = payload === null || payload === void 0 ? void 0 : payload.cohortId;
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
        const cohortId = socket.data.cohortId;
        const userId = socket.data.userId;
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
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
// Database Connection
mongoose_1.default
    .connect(env_1.config.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/cohorts", cohortRoutes_1.default);
app.use("/api/goals", goalRoutes_1.default);
app.use("/api/checkins", checkInRoutes_1.default);
app.use("/api/support", supportRoutes_1.default);
app.use("/api/analytics", analyticsRoutes_1.default);
app.use("/api/meetings", meetingRoutes_1.default);
app.use("/api/messages", messageRoutes_1.default);
app.use("/public", publicRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/checkin-sessions", checkInSessionRoutes_1.default);
app.use("/api/invite-codes", inviteCodeRoutes_1.default);
app.get("/", (req, res) => {
    res.send("Ziptech Labs API Running");
});
// Start Server
server.listen(env_1.config.PORT, () => {
    console.log(`Server running on port ${env_1.config.PORT}`);
});
