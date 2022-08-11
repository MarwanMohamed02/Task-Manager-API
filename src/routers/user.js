"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const userRouter = express_1.default.Router();
exports.userRouter = userRouter;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const userModel_1 = require("../db/models/userModel");
const auth_1 = require("../middleware/auth");
const errHandler_1 = require("../middleware/errHandler");
const account_1 = require("../emails/account");
// POST
userRouter.post("/users", async (req, res) => {
    const user = new userModel_1.User(req.body);
    (0, account_1.greetUser)(user);
    try {
        await user.save();
        const token = await userModel_1.User.genAuthToken(user);
        res.status(201).send({ user: userModel_1.User.getPublicProfile(user), token });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
userRouter.post("/users/login", async (req, res) => {
    try {
        const user = await userModel_1.User.findByLogin(req.body.email, req.body.password);
        const token = await userModel_1.User.genAuthToken(user);
        res.send({ user: userModel_1.User.getPublicProfile(user), token });
    }
    catch (err) {
        res.status(400).send({ error: err.message });
    }
});
userRouter.post("/users/logout", auth_1.auth, async (req, res) => {
    try {
        if (req.user) {
            req.user.tokens = req.user.tokens?.filter(token => token.token !== req.token);
            await req.user.save();
            res.send();
        }
    }
    catch (err) {
        res.status(500).send();
    }
});
userRouter.post("/users/logoutAll", auth_1.auth, async (req, res) => {
    try {
        if (req.user) {
            req.user.tokens = [];
            await req.user.save();
            res.send();
        }
    }
    catch (err) {
        res.status(500).send();
    }
});
const avatarUpload = (0, multer_1.default)({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            cb(new Error("Please upload an image"));
        cb(null, true);
    }
});
userRouter.post("/users/me/avatar", auth_1.auth, avatarUpload.single("avatar"), async (req, res) => {
    if (req.user) {
        req.user.avatar = await (0, sharp_1.default)(req.file?.buffer)
            .resize(250, 250)
            .png()
            .toBuffer();
        await req.user.save();
    }
    res.send();
}, errHandler_1.errHandler);
// GET
userRouter.get("/users/me", auth_1.auth, async (req, res) => {
    if (req.user && req.token)
        res.send({
            user: userModel_1.User.getPublicProfile(req.user),
            token: req.token
        });
});
userRouter.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await userModel_1.User.findById(req.params.id);
        if (!user || !user.avatar)
            throw new Error();
        res.set("Content-Type", "image/jpg");
        res.send(user.avatar);
    }
    catch (err) {
        res.status(404).send();
    }
});
// PATCH
userRouter.patch("/users/me", auth_1.auth, async (req, res) => {
    try {
        if (req.user) {
            const updates = Object.keys(req.body);
            const userObj = req.user.toObject();
            const allowedUpdates = Object.keys(userObj).filter(key => key != "_id" && key != "__v");
            const isValidUpdate = updates.every(update => allowedUpdates.includes(update));
            if (!isValidUpdate) {
                return res.status(400).send({ error: "Invalid Update!" });
            }
            updates.forEach((update) => {
                userObj[update] = req.body[update];
            });
            await req.user.overwrite(userObj).save();
            res.send({ user: userModel_1.User.getPublicProfile(req.user) });
        }
    }
    catch (e) {
        res.status(400).send();
    }
});
// DELETE
userRouter.delete("/users/me", auth_1.auth, async (req, res) => {
    try {
        if (req.user) {
            const removedUser = await req.user.remove();
            (0, account_1.sendCancellationEmail)(removedUser);
            res.send(userModel_1.User.getPublicProfile(removedUser));
        }
    }
    catch (err) {
        res.status(500).send();
    }
});
userRouter.delete("/users/me/avatar", auth_1.auth, async (req, res) => {
    if (req.user && req.user.avatar) {
        req.user.avatar = undefined;
        await req.user.save();
    }
    else
        return res.status(404).send({ message: "You don't have an avatar!" });
    res.send();
});
