"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
exports.app = app;
require("./db/mongoose");
const user_1 = require("./routers/user");
const task_1 = require("./routers/task");
// Automatically parses the response
app.use(express_1.default.json());
// Connect Routers
app.use(user_1.userRouter);
app.use(task_1.taskRouter);
