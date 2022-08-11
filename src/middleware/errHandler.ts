import { ErrorRequestHandler, NextFunction, Request, Response } from "express"


const errHandler: ErrorRequestHandler = ({ message }, req: Request, res: Response, next: NextFunction) => {
    res.status(400).send({ error: message });
}


export { errHandler }