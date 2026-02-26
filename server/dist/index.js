"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
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
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Database Connection
mongoose_1.default.connect(env_1.config.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Connection Error:', err));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/cohorts', cohortRoutes_1.default);
app.use('/api/goals', goalRoutes_1.default);
app.use('/api/checkins', checkInRoutes_1.default);
app.use('/api/support', supportRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/meetings', meetingRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Ziptech Labs API Running');
});
// Start Server
app.listen(env_1.config.PORT, () => {
    console.log(`Server running on port ${env_1.config.PORT}`);
});
