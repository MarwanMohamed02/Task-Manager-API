"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCancellationEmail = exports.greetUser = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const sgAPIKey = process.env.SENDGRID_API_KEY;
const from = "marwanabbas2909@gmail.com";
if (sgAPIKey)
    mail_1.default.setApiKey(sgAPIKey);
async function greetUser({ email, name }) {
    mail_1.default.send({
        to: email,
        from,
        subject: `Welcome ${name}!`,
        text: `Thanks for joining us`,
    });
}
exports.greetUser = greetUser;
async function sendCancellationEmail({ email, name }) {
    mail_1.default.send({
        to: email,
        from,
        subject: `Goodbye ${name} :(`,
        text: `We will miss you ${name}, please let us know how we could've kept you on board`
    });
}
exports.sendCancellationEmail = sendCancellationEmail;
