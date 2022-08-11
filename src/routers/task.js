"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRouter = void 0;
const express_1 = __importDefault(require("express"));
const taskRouter = express_1.default.Router();
exports.taskRouter = taskRouter;
const taskModel_1 = require("../db/models/taskModel");
const auth_1 = require("../middleware/auth");
// POST
taskRouter.post("/tasks", auth_1.auth, async (req, res) => {
    const task = new taskModel_1.Task({
        ...req.body,
        owner: req.user?._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// GET
taskRouter.get("/tasks", auth_1.auth, async (req, res) => {
    // Filter
    let match = {};
    if (req.query.completed)
        match.completed = req.query.completed === "true";
    // Pagination
    let options = {};
    options.limit = req.query.limit;
    options.skip = req.query.skip;
    // Sorting
    const sortQuery = req.query.sort?.toString().split(":");
    let field = sortQuery?.at(0);
    let sortType = sortQuery?.at(1) === "asc" ? 1 : -1;
    let sort = {};
    sort[field] = sortType;
    options.sort = sort;
    try {
        await req.user?.populate({
            path: "tasks",
            match,
            options
        });
        const tasks = req.user?.toObject().tasks;
        if (tasks.length === 0) {
            return res.status(404).send({ message: "You have no tasks!" });
        }
        res.send(tasks);
    }
    catch (err) {
        res.status(500).send();
    }
});
taskRouter.get("/tasks/:id", auth_1.auth, async (req, res) => {
    try {
        let _id = req.params.id;
        let owner = req.user?._id;
        const task = await taskModel_1.Task.findOne({ _id, owner });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    }
    catch (err) {
        res.status(500).send();
    }
});
// PATCH
taskRouter.patch("/tasks/:id", auth_1.auth, async (req, res) => {
    try {
        let _id = req.params.id;
        let owner = req.user?._id;
        const task = await taskModel_1.Task.findOne({ _id, owner });
        if (!task) {
            return res.status(404).send();
        }
        const updates = Object.keys(req.body);
        const taskObj = task.toObject();
        const allowedUpdates = Object.keys(taskObj).filter(key => key != "_id" && key != "__v");
        const isValidUpdate = updates.every(update => allowedUpdates.includes(update));
        if (!isValidUpdate) {
            return res.status(400).send({ error: "Invalid Update" });
        }
        updates.forEach((update) => {
            taskObj[update] = req.body[update];
        });
        await task.overwrite(taskObj).save();
        res.send(task);
    }
    catch (e) {
        res.status(400).send();
    }
});
// DELETE
taskRouter.delete("/tasks/:id", auth_1.auth, async (req, res) => {
    try {
        let _id = req.params.id;
        let owner = req.user?._id;
        const task = await taskModel_1.Task.findOneAndDelete({ _id, owner });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    }
    catch (err) {
        res.status(500).send();
    }
});
