const bcrypt = require('bcrypt') ;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const prisma = require('../prisma/prisma');

exports.createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const {name, email} = data;
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  return user;
};

exports.updateLoginData = (id) => {
  return prisma.user.update({
    where: { id },
    data: {
      loginFrequency: {
        increment: 1,
      },
      lastLogin: {
        set: new Date(),
      }
    },
  });
}
exports.findById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    omit: {password: true}
  });
}

exports.validateUserPassword = (passwordInRequest, hashedPasswordInDatabase) => {
  return bcrypt.compare(passwordInRequest, hashedPasswordInDatabase);
};

exports.findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
}