import express from "express"
const app = express();
require("./db/mongoose")
import { userRouter } from "./routers/user"
import { taskRouter } from "./routers/task"


const port = process.env.PORT;


// Automatically parses the response
app.use(express.json());


// Connect Routers
app.use(userRouter);
app.use(taskRouter);
app.use((err, req, res) => {

})

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})


