"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cohortController_1 = require("../controllers/cohortController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const verifiedMiddleware_1 = require("../middleware/verifiedMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, verifiedMiddleware_1.requireVerified, cohortController_1.createCohort);
router.get('/', authMiddleware_1.protect, verifiedMiddleware_1.requireVerified, cohortController_1.getCohorts);
router.get('/my-cohort', authMiddleware_1.protect, verifiedMiddleware_1.requireVerified, cohortController_1.getMyCohort);
router.post('/join', authMiddleware_1.protect, verifiedMiddleware_1.requireVerified, cohortController_1.joinCohort);
router.get('/:id', authMiddleware_1.protect, verifiedMiddleware_1.requireVerified, cohortController_1.getCohort);
exports.default = router;
