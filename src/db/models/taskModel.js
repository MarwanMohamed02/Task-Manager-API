"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
// Schema
const taskSchema = new mongoose_1.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
}, {
    timestamps: true,
});
// Creating model
const Task = (0, mongoose_1.model)("Task", taskSchema);
exports.Task = Task;
