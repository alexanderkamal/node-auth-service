const userService = require("../services/user.service.js");

exports.register = async(req, res, next) => {
    try {
        const user = await userService.register(req.body.email, req.body.password, req.correlationId);
        res.status(201).json( {email: user.email});
    }
    catch (error) {
        // console.log(error);
        // console.log(typeof error);
        // console.log(error instanceof Error);
        next(error);
    }
}

exports.login = async(req, res, next) => {
    try {
        const {accessToken, refreshToken} = await userService.login(req.body.email, req.body.password);
        res.status(200).json({accessToken, refreshToken});
    }
    catch (error) {
        next(error);
    }
}

exports.getMe = async(req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        const user = userService.getMe(token);
        res.json({user});
    }
    catch (error) {
        next(error);
    }
}

exports.refresh = async(req, res, next) => {
    try {
        const token = req.body.token;
        if (!token) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        const {newAccessToken} = userService.refresh(token);
        res.json({newAccessToken});
    }
    catch (error) {
        next(error);
    }
}