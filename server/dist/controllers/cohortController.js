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
exports.getCohort = exports.joinCohort = exports.getCohorts = exports.createCohort = void 0;
const Cohort_1 = __importDefault(require("../models/Cohort"));
// @desc    Create a new cohort
// @route   POST /api/cohorts
// @access  Private (Admin/Coach)
const createCohort = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, startDate, endDate } = req.body;
    if (!name) {
        res.status(400).json({ message: 'Please add a cohort name' });
        return;
    }
    try {
        const cohort = yield Cohort_1.default.create({
            name,
            startDate,
            endDate,
            facilitator: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        res.status(201).json(cohort);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.createCohort = createCohort;
// @desc    Get all cohorts
// @route   GET /api/cohorts
// @access  Private
const getCohorts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cohorts = yield Cohort_1.default.find()
            .populate('facilitator', 'name email')
            .populate('members', 'name email');
        res.status(200).json(cohorts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getCohorts = getCohorts;
// @desc    Join a cohort via Invite Code
// @route   POST /api/cohorts/join
// @access  Private
const joinCohort = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { inviteCode } = req.body;
    if (!inviteCode) {
        res.status(400).json({ message: 'Please provide an invite code' });
        return;
    }
    try {
        const cohort = yield Cohort_1.default.findOne({ inviteCode });
        if (!cohort) {
            res.status(404).json({ message: 'Invalid invite code' });
            return;
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const isMember = cohort.members.some((memberId) => memberId.toString() === userId.toString());
        if (isMember) {
            res.status(400).json({ message: 'You are already a member of this cohort' });
            return;
        }
        cohort.members.push(userId);
        yield cohort.save();
        if (req.user) {
            req.user.cohort = cohort._id;
            yield req.user.save();
        }
        res.status(200).json(cohort);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.joinCohort = joinCohort;
// @desc    Get cohort details
// @route   GET /api/cohorts/:id
// @access  Private
// Added this missing controller logic from previous view
const getCohort = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const cohort = yield Cohort_1.default.findById(req.params.id)
            .populate('members', 'name email role')
            .populate('facilitator', 'name email');
        if (!cohort) {
            res.status(404).json({ message: 'Cohort not found' });
            return;
        }
        // Authorization check
        // Check if user is member or facilitator or admin
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString();
        // Assuming members are populated but we might need to check IDs carefully if populated
        // Wait, if populated, members is array of objects. 
        // Need to be careful with type checking.
        // It is safer to re-fetch or use unpopulated members array from DB if schema allows, 
        // or check against populated _id.
        // Cohort.members is typed as string[] | IUser[]
        const isMember = cohort.members.some(m => (m._id ? m._id.toString() : m.toString()) === userId);
        const isFacilitator = cohort.facilitator._id
            ? cohort.facilitator._id.toString() === userId
            : cohort.facilitator.toString() === userId;
        if (!isMember && !isFacilitator && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            res.status(403).json({ message: 'Not authorized to view this cohort' });
            return;
        }
        res.status(200).json(cohort);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getCohort = getCohort;
