"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cohortController_1 = require("../controllers/cohortController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, cohortController_1.createCohort);
router.get('/', authMiddleware_1.protect, cohortController_1.getCohorts);
router.post('/join', authMiddleware_1.protect, cohortController_1.joinCohort);
router.get('/:id', authMiddleware_1.protect, cohortController_1.getCohort);
exports.default = router;
