"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../db/models/userModel");
const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token)
            throw new Error();
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await userModel_1.User.findOne({ _id: decoded, "tokens.token": token });
        if (!user)
            throw new Error();
        req.user = user;
        req.token = token;
        next();
    }
    catch (err) {
        res.status(401).send({ error: "Authentication required" });
    }
};
exports.auth = auth;
