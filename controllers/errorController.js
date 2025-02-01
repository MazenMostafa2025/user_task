const sendErrorDev = (err, req, res) => {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      errors: err.errors || null,
    });
};
const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors || null,
    });
  }
  console.error('ERROR 💥', err); 
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.log('dev')
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    console.log('prod')
    sendErrorProd(err, req, res);
  }
};
