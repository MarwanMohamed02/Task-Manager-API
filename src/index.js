"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
require("./db/mongoose");
const user_1 = require("./routers/user");
const task_1 = require("./routers/task");
const port = process.env.PORT;
// Automatically parses the response
app.use(express_1.default.json());
// Connect Routers
app.use(user_1.userRouter);
app.use(task_1.taskRouter);
app.use((err, req, res) => {
});
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
