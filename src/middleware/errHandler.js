"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errHandler = void 0;
const errHandler = ({ message }, req, res, next) => {
    res.status(400).send({ error: message });
};
exports.errHandler = errHandler;
