"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const taskModel_1 = require("./taskModel");
//type UserModel = Model<IUser, {}, IUserMethods>;
// Schema
const userSchema = new mongoose_1.Schema({
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
        validate(mail) {
            if (!validator_1.default.isEmail(mail)) {
                throw new Error("The email entered is invalid");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(pass) {
            if (pass.toLowerCase().includes("password")) {
                throw new Error("Password cannot contain 'password'");
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age has to be positive");
            }
        }
    },
    tokens: [{
            token: {
                type: String,
                required: true // to not have any empty tokens
            }
        }],
    avatar: {
        type: Buffer,
    }
}, {
    toJSON: { getters: true, virtuals: true },
    toObject: { virtuals: true },
});
// Virtuals
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner",
});
// User Login
userSchema.statics.findByLogin = async function (email, password) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Unable to login");
    }
    else if (!(await bcryptjs_1.default.compare(password, user.password))) {
        throw new Error("Unable to login");
    }
    return user;
};
userSchema.statics.genAuthToken = async function (user) {
    let token = jsonwebtoken_1.default.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    ;
    user.tokens = user.tokens?.concat({ token });
    await user.save();
    return token;
};
// Reading Profile
userSchema.statics.getPublicProfile = function (user) {
    const { _id, age, name, email } = user;
    return {
        _id,
        age,
        name,
        email
    };
};
// Middleware
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const hashedPass = await bcryptjs_1.default.hash(this.password, 12);
        this.password = hashedPass;
    }
});
userSchema.pre("remove", async function () {
    // await this.populate("tasks");
    // let userObj = this.toObject();
    // console.log(userObj.tasks);
    // userObj.tasks.forEach(async (task: ITask) => {
    //     await Task.findByIdAndDelete({ _id: task._id });
    // })
    await taskModel_1.Task.deleteMany({ owner: this._id });
});
// Creating model
const User = (0, mongoose_1.model)("User", userSchema);
exports.User = User;
