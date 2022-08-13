import { Schema, model, HydratedDocument, Document, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Task, ITask } from "./taskModel";

/* Creating interface and schema for the models */

// Interface => defining the types of the fields
// Schema => ka2enena bn-configure l constructor bta3 l interface (3shan kda bnst5dm uppercase fl types dol constructor functions)


// Schema Interfaces
type Token = {
    token: string,
}

interface publicData {
    _id: string,
    name: string,
    age: number,
    email:string,
}

// Interfaces
interface IUser extends Document {
    name: string,
    age: number,
    email: string,
    password: string,
    tokens?: Token[],
    avatar?: Buffer | undefined,
}

// Mehtods
// interface IUserMethods {
//     genAuthToken(): Promise<string>;
// }

// Statics
interface UserModel extends Model<IUser> {
    findByLogin(email: any, password: any): Promise<IUser>,
    genAuthToken(user: IUser): Promise<string>,
    getPublicProfile(user: IUser): publicData,
}

//type UserModel = Model<IUser, {}, IUserMethods>;



// Schema
const userSchema = new Schema<IUser, UserModel>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            validate(mail: string) {
                if (!validator.isEmail(mail)) {
                    throw new Error("The email entered is invalid");
                }
            }
        },
        password: {
            type: String,
            required: true,
            minLength: 7,
            trim: true,
            validate(pass: string) {
                if (pass.toLowerCase().includes("password")) {
                    throw new Error("Password cannot contain 'password'");
                }
            }
        },
        age: {
            type: Number,
            default: 0,
            validate(value: number) {
                if (value < 0) {
                    throw new Error("Age has to be positive");
                }
            }
        },
        tokens: [{
            token: {
                type: String,
                required: true  // to not have any empty tokens
            }
        }],
        avatar: {
            type: Buffer,
        }
    },
    {
        toJSON: { getters: true, virtuals: true },
        toObject: { virtuals: true },
    }
)


// Virtuals
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner",
})


// User Login
userSchema.statics.findByLogin = async function (email: any, password: any): Promise<IUser> {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Unable to login");
    }
    else if (!(await bcrypt.compare(password, user.password))) {
        throw new Error("Unable to login");
    }
    return user;
}

userSchema.statics.genAuthToken = async function (user: IUser): Promise<string> {
    
    let token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET as string);;

    user.tokens = user.tokens?.concat({token});
    
    await user.save();

    return token;
}

// Reading Profile
userSchema.statics.getPublicProfile = function (user: IUser): publicData {
    const { _id, age, name, email } = user;
    return {
        _id,
        age,
        name,
        email
    }
}


// Middleware
userSchema.pre<IUser>("save", async function () {
    if (this.isModified("password")) {
        const hashedPass = await bcrypt.hash(this.password, 12);
        this.password = hashedPass;
    }
})


userSchema.pre<IUser>("remove", async function () {
    // await this.populate("tasks");
    // let userObj = this.toObject();

    // console.log(userObj.tasks);
    // userObj.tasks.forEach(async (task: ITask) => {
    //     await Task.findByIdAndDelete({ _id: task._id });
    // })

    await Task.deleteMany({ owner: this._id });

})


// Creating model
const User = model<IUser, UserModel>("User", userSchema);

export { User, IUser, Token }