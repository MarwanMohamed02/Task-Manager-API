import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { IUser, Token, User } from "../db/models/userModel"

interface authRequest extends Request {
    user?: IUser,
    token?:string
}

const auth = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token)
            throw new Error();
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        
        const user = await User.findOne({ _id: decoded, "tokens.token": token });
    
        if (!user)
            throw new Error();
        
        req.user = user;
        req.token = token;

        next()
    }
    catch (err) {
        res.status(401).send({ error: "Authentication required" });
    }


}

export { auth, authRequest }