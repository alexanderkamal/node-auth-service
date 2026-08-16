const userRepo = require('../repositories/user.repository');
const {hashPassword, comparePassword} = require('../utils/hash');
const {createAccessToken, createRefreshToken, verifyRefreshToken, verifyAccessToken} = require('../utils/jwt');
const {UserAlreadyExistsError} = require('../errors.js');
const AppError = require('../../../common/error/AppError.js');
const logger = require('../../../common/logger/logger.js');

// 1. register user
exports.register = async (email, password, correlationId) => {
    logger.info(`Attempting to register user with email: ${email}`, correlationId);
    const exists = await userRepo.findByEmail(email);
    if (exists) throw UserAlreadyExistsError;

    const hashedPassword = await hashPassword(password);
    return await userRepo.create(email, hashedPassword);
}

// 2. login user
exports.login = async (email, password) => {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error('Invalid Credentials');

    const isCorrectPassword = await comparePassword(password, user.password);
    if (!isCorrectPassword) throw new Error('Invalid Credentials');

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return {accessToken, refreshToken};
}

// 3. get current user
exports.getMe = (token) => {
    return verifyAccessToken(token);
}

// 4. refresh access token
exports.refresh = (token) => {
    const user = verifyRefreshToken(token);
    const newAccessToken = createAccessToken(user);
    return {newAccessToken};
}