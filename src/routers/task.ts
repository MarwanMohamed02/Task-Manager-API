import express from "express"
const taskRouter = express.Router();
import { Task } from "../db/models/taskModel"
import { auth, authRequest } from "../middleware/auth";



// POST
taskRouter.post("/tasks", auth, async (req:authRequest, res) => {

    const task = new Task({
        ...req.body,
        owner: req.user?._id
    })
    
    try {
        await task.save();
        res.status(201).send(task);
    }
    catch (err) {
        res.status(400).send(err);
    }
})


// GET
taskRouter.get("/tasks", auth, async (req: authRequest, res) => {

    // Filter
    let match: { [key: string]: any } = {  };

    if (req.query.completed)
        match.completed = req.query.completed === "true"
    
    
    // Pagination
    let options: { [key: string]: any } = {};

    options.limit = req.query.limit;
    options.skip = req.query.skip;


    // Sorting
    const sortQuery = req.query.sort?.toString().split(":");
    let field = sortQuery?.at(0);
    let sortType = sortQuery?.at(1) === "asc" ? 1 : -1;
    
    let sort: { [key: string]: any } = {}
    
    sort[field as keyof typeof sort] = sortType;

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
})

taskRouter.get("/tasks/:id", auth, async (req: authRequest, res) => {
    try {
        let _id = req.params.id;
        let owner = req.user?._id;

        const task = await Task.findOne({ _id, owner });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    }
    catch (err) {
        res.status(500).send();
    }
})


// PATCH
taskRouter.patch("/tasks/:id", auth, async (req: authRequest, res) => {

    try {
        let _id = req.params.id;
        let owner = req.user?._id;

        const task = await Task.findOne({ _id, owner });       

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

        updates.forEach((update: string) => {
            taskObj[update as keyof typeof Task] = req.body[update];
        })

        await task.overwrite(taskObj).save();

        res.send(task);
    }
    catch (e) {
        res.status(400).send();
    }
})


// DELETE
taskRouter.delete("/tasks/:id", auth, async (req: authRequest, res) => {

    try {
        let _id = req.params.id;
        let owner = req.user?._id;

        const task = await Task.findOneAndDelete({ _id, owner });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    }
    catch (err) {
        res.status(500).send();
    }
})

export { taskRouter }