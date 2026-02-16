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
exports.updateGoal = exports.getGoals = exports.createGoal = void 0;
const Goal_1 = __importDefault(require("../models/Goal"));
const Cohort_1 = __importDefault(require("../models/Cohort"));
// Helper to get current week number
const getWeekNumber = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
};
// @desc    Create a goal (Public or Private)
// @route   POST /api/goals
// @access  Private
const createGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { type, description, subTasks } = req.body;
    try {
        if (!['public', 'private'].includes(type)) {
            res.status(400).json({ message: 'Invalid goal type' });
            return;
        }
        // Check if user is in a cohort
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.cohort)) {
            res.status(400).json({ message: 'You must join a cohort first' });
            return;
        }
        const cohort = yield Cohort_1.default.findById(req.user.cohort);
        if (!cohort) {
            res.status(404).json({ message: 'Cohort not found' });
            return;
        }
        const weekNumber = getWeekNumber(cohort.startDate);
        // Check if goal already exists for this week and type
        const existingGoal = yield Goal_1.default.findOne({
            user: req.user._id,
            weekNumber,
            type
        });
        if (existingGoal) {
            res.status(400).json({ message: `You already have a ${type} goal for this week` });
            return;
        }
        const goal = yield Goal_1.default.create({
            user: req.user._id,
            cohort: req.user.cohort,
            type,
            description,
            weekNumber,
            subTasks: subTasks || []
        });
        res.status(201).json(goal);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createGoal = createGoal;
// @desc    Get goals
// @route   GET /api/goals
// @access  Private
const getGoals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.cohort)) {
            res.status(200).json([]);
            return;
        }
        const cohort = yield Cohort_1.default.findById(req.user.cohort);
        if (!cohort) {
            res.status(404).json({ message: 'Cohort not found' });
            return;
        }
        const currentWeek = getWeekNumber(cohort.startDate);
        if (req.query.mine === 'true') {
            const myGoals = yield Goal_1.default.find({ user: req.user._id, weekNumber: currentWeek });
            res.status(200).json(myGoals);
            return;
        }
        const publicGoals = yield Goal_1.default.find({
            cohort: req.user.cohort,
            weekNumber: currentWeek,
            type: 'public'
        }).populate('user', 'name');
        const myPrivateGoal = yield Goal_1.default.findOne({
            user: req.user._id,
            weekNumber: currentWeek,
            type: 'private'
        });
        const results = {
            week: currentWeek,
            publicGoals,
            myPrivateGoal
        };
        res.status(200).json(results);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getGoals = getGoals;
// @desc    Update goal status
// @route   PATCH /api/goals/:id
// @access  Private
const updateGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const goal = yield Goal_1.default.findById(req.params.id);
        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }
        // Check user (using string comparison for IDs)
        if (goal.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }
        const updatedGoal = yield Goal_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json(updatedGoal);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateGoal = updateGoal;
