"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheckIns = exports.createCheckIn = void 0;
const CheckIn_1 = __importDefault(require("../models/CheckIn"));
const Goal_1 = __importDefault(require("../models/Goal"));
const CheckInSession_1 = __importDefault(require("../models/CheckInSession"));
// @desc    Submit a check-in for a goal
// @route   POST /api/checkins
// @access  Private
const createCheckIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { goalId, goal, status, blockerNote, blocker } = req.body;
    try {
        const targetGoalId = goalId || goal;
        if (!targetGoalId) {
            res.status(400).json({ message: 'Missing goalId' });
            return;
        }
        const goalDoc = yield Goal_1.default.findById(targetGoalId);
        if (!goalDoc) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }
        if (goalDoc.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }
        // Check if already checked in
        const existingCheckIn = yield CheckIn_1.default.findOne({ goal: targetGoalId });
        if (existingCheckIn) {
            res.status(400).json({ message: 'Already checked in for this goal' });
            return;
        }
        const checkIn = yield CheckIn_1.default.create({
            user: req.user._id,
            goal: targetGoalId,
            weekNumber: goalDoc.weekNumber,
            status,
            blockerNote: blockerNote || blocker
        });
        // Update goal status as well to match check-in
        goalDoc.status = status;
        yield goalDoc.save();
        const cohortId = (_b = goalDoc.cohort) === null || _b === void 0 ? void 0 : _b.toString();
        if (cohortId && req.user) {
            const existingSession = yield CheckInSession_1.default.findOne({ cohort: cohortId, active: true });
            if (!existingSession) {
                const session = yield CheckInSession_1.default.create({
                    cohort: cohortId,
                    active: true,
                    startedBy: req.user._id
                });
                const io = req.app.get('io');
                if (io) {
                    io.to(`cohort:${cohortId}`).emit('session', { active: true });
                }
                console.log('Check-in session started from check-in', {
                    cohortId,
                    sessionId: session._id.toString()
                });
            }
        }
        res.status(201).json(checkIn);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createCheckIn = createCheckIn;
// @desc    Get check-ins (history)
// @route   GET /api/checkins
// @access  Private
const getCheckIns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // req.user is guaranteed by AuthMiddleware usually, but optional in type
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const checkIns = yield CheckIn_1.default.find({ user: req.user._id })
            .populate('goal', 'description type weekNumber')
            .sort({ createdAt: -1 });
        res.status(200).json(checkIns);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCheckIns = getCheckIns;
