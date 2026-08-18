const AppError = require("../../common/error/AppError.js");

module.exports = {
    UserAlreadyExistsError: new AppError('User with this email already exists', 400)
}