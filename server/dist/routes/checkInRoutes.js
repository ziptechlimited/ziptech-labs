"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkInController_1 = require("../controllers/checkInController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const verifiedMiddleware_1 = require("../middleware/verifiedMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, verifiedMiddleware_1.requireVerified, checkInController_1.createCheckIn);
router.get('/', authMiddleware_1.protect, verifiedMiddleware_1.requireVerified, checkInController_1.getCheckIns);
exports.default = router;
