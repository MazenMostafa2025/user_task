const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const authService = require('../services/authService');
const { validationResult } = require('express-validator');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN 
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.id);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }
  const { name, email, password} = req.body;
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email and password.', 400));
  }
  const user = await authService.createUser({name, email, password});

  const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_VERIFICATION_TOKEN_EXPIRES_IN });
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const emailContent = `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`;
  // send link with verification token in query param to user email
  await sendEmail(email, 'Verify your email', emailContent);

  res.status(201).json({
    status: 'success',
    message: 'User created successfully, please access your email to verify your account', 
    data: {
      user
    }
  })
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;
  if (!token) {
    return next(new AppError('Invalid verification token', 400));
  }
  // Verify token by comparing to our jwt secret key
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  // find if user exist, is already verified, and if token in query param is the same as one stored in database
  const user = await authService.findUserByEmail(decoded.email);
  if (!user) {
    return next(new AppError('User not found', 400));
  }
  if (user.isVerified) {
    return next(new AppError('Email already verified', 400));
  }
  if (user.verificationToken !== token) {
    return next(new AppError('Verification token mismatch', 400));
  }
  // update user to be verified and verification token to be null
  await prisma.user.update({
    where: { email },
    data: { isVerified: true, verificationToken: null },
  });
  res.status(200).json({ status: 'success', message: 'Email verified successfully' });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user entered email and password
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }
  // Check if user exists
  const user = await authService.findUserByEmail(email);
  if (!user) {
    return next(new AppError('Incorrect email or password', 400));
  }
  // Check if password is correct
  const matched = await authService.validateUserPassword(password, user.password);
  if (!matched) {
    return next(new AppError('Incorrect email or password', 400));
  }
  // update login frequency
  await authService.updateLoginData(user.id);

  // return jwt and user data in response
  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // Verify token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await authService.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token no longer exists.',
        401
      )
    );
  }
  // Check if user is verified
  if (!currentUser.isVerified) return next(new AppError('Please verify your email.', 401)); 
  // Check if user got deleted
  if (currentUser.isDeleted) return next(new AppError('This user has been deleted.', 401));

  // save user data in req.user for future use
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};


