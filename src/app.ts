import express from "express"
const app = express();
require("./db/mongoose")
import { userRouter } from "./routers/user"
import { taskRouter } from "./routers/task"



// Automatically parses the response
app.use(express.json());


// Connect Routers
app.use(userRouter);
app.use(taskRouter);


export { app }


