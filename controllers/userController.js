const catchAsync = require('../utils/catchAsync')
const userService = require('../services/userService');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getTopLoginFrequency = catchAsync(async (req, res, next) => {

  const topUsersByLoginFrequency = await userService.getTopLoginFrequency();
  res.status(200).json({
    status: 'success',
    data:  topUsersByLoginFrequency,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { name, email, isVerified, startDate, endDate, page = 1, limit = 10 } = req.query;

  const users = await userService.getFilteredUsers({ name, email, isVerified, startDate, endDate, page, limit });

  res.status(200).json({
    status: 'success',
    data: users,
  });
});


exports.updateMe = catchAsync(async(req, res, next) => {
  // Create error if user POSTs password data
  if (req.body.password) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await userService.updateUser(req.user.id, filteredBody);
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});


exports.getMe = catchAsync(async(req, res, next) => {
  const user = await userService.getUserDetails(req.user.id);
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await userService.softDeleteUser(req.user.id);

  res.status(204).json({
    status: 'success',
    data: null,
    message: 'user was deleted successfully',
  });
});


exports.getInactiveUsers = catchAsync(async (req, res, next) => {
    const { period } = req.query; 
    const allowedPeriods = ['hour', 'month'];
    if (!allowedPeriods.includes(period)) {
      return next(new AppError('Invalid period. Use "hour" or "month".', 400));
    }
    const data = await userService.getInactiveUsers({period});
    res.status(200).json({ status: 'success', ...data });  
});