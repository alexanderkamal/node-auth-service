const prisma = require('../../../common/db/prsima');

// const {users} = require("../models/user")

exports.findByEmail = async (email) => {
    // return users.find(u => u.email === email)
    return prisma.user.findUnique({
        where: {
            email: email
        }
    })
}

exports.create = async (email, hashedPassword) => {
    return prisma.user.create({
        data: {
            email: email,
            password: hashedPassword
        }
    })
    // const user = {email, password: hashedPassword}
    // users.push(user)
    // return user;
}