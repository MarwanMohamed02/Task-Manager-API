import mongoose, { Schema, model, HydratedDocument, Document, Model } from "mongoose";
import { IUser } from "./userModel";

/* Creating interface and schema for the models */

// Interface => defining the types of the fields
// Schema => ka2enena bn-configure l constructor bta3 l interface (3shan kda bnst5dm uppercase fl types dol constructor functions)


// Interface
interface ITask extends Document {
    description: string,
    completed: boolean,
    owner: Schema.Types.ObjectId,
}


// Schema
const taskSchema = new Schema<ITask>(
    {
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
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        }
    },
    {
        timestamps: true,
    }
)



// Creating model
const Task = model<ITask>("Task", taskSchema);



export { Task, ITask }