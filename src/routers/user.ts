import express, { ErrorRequestHandler, Request, Response } from "express"
const userRouter = express.Router();
import multer from "multer"
import sharp from "sharp"
import { IUser, User } from "../db/models/userModel"
import { auth, authRequest } from "../middleware/auth"
import { errHandler } from "../middleware/errHandler"
import { greetUser, sendCancellationEmail } from "../emails/account"



// POST
userRouter.post("/users", async (req, res) => {
    const user = new User(req.body);


    try {
        await user.save();
        
        const token = await User.genAuthToken(user);

        greetUser(user);

        res.status(201).send({user: User.getPublicProfile(user), token});
    }
    catch (err) {
        res.status(400).send(err)
    }

})

userRouter.post("/users/login", async (req, res) => {
    
    try {
        const user:IUser = await User.findByLogin(req.body.email, req.body.password);

        const token = await User.genAuthToken(user);
        res.send({user: User.getPublicProfile(user), token});
    }
    catch (err: any) {
        res.status(400).send({error:err.message});
    }
})

userRouter.post("/users/logout", auth, async (req: authRequest, res) => {
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
})

userRouter.post("/users/logoutAll", auth, async (req: authRequest, res) => {
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
})

const avatarUpload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            cb(new Error("Please upload an image"));
        
        cb(null, true);
    }
});

userRouter.post("/users/me/avatar", auth, avatarUpload.single("avatar"), async (req: authRequest, res: Response) => {
    if (req.user) {
        req.user.avatar = await sharp(req.file?.buffer)
            .resize(250, 250)
            .png()
            .toBuffer();
        await req.user.save();
    }

    res.send();
}, errHandler)


// GET
userRouter.get("/users/me", auth, async (req: authRequest, res) => {
    if (req.user && req.token)
        res.send({
            user: User.getPublicProfile(req.user),
            token: req.token
        });     
})


userRouter.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar)
            throw new Error();
        
        res.set("Content-Type", "image/jpg");
        res.send(user.avatar);
    }
    catch (err) {
        res.status(404).send();
    }
})



// PATCH
userRouter.patch("/users/me", auth, async (req:authRequest, res) => {    

    try {
        if (req.user) {
            const updates = Object.keys(req.body);
            const userObj = req.user.toObject();
            
            const allowedUpdates = Object.keys(userObj).filter(key => key != "_id" && key != "__v");
    
            const isValidUpdate = updates.every(update => allowedUpdates.includes(update));
    
            if (!isValidUpdate) {
                return res.status(400).send({ error: "Invalid Update!" });
            }
    
            updates.forEach((update: string) => {
                userObj[update as keyof IUser] = req.body[update];
            });
    
            await req.user.overwrite(userObj).save();
    
            res.send({ user: User.getPublicProfile(req.user) });
        }     
    }
    catch (e) {
        res.status(400).send();
    }
})


// DELETE
userRouter.delete("/users/me", auth, async (req:authRequest, res) => {

    try {
      
        if (req.user) {
            const removedUser = await req.user.remove()
            sendCancellationEmail(removedUser);
            res.send(User.getPublicProfile(removedUser));
        }

    }
    catch (err) {
        res.status(500).send();
    }
})


userRouter.delete("/users/me/avatar", auth, async (req: authRequest, res) => {
    if (req.user && req.user.avatar) {
        req.user.avatar = undefined;
        await req.user.save();
    }
    else 
        return res.status(404).send({ message: "You don't have an avatar!" });
    

    res.send();
})

export { userRouter }
