const rateLimit = require('express-rate-limit');
const express = require('express');
const AppError = require('./utils/appError');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
// const cors = require('cors');
const xss = require('xss-clean');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');

const app = express();



// 1) GLOBAL MIDDLEWARES
// Implement CORS
// app.use(cors());
// app.use(cors({
//   origin: 'origin-url'
// }))

// app.options('*', cors());



// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], 
        scriptSrc: ["'self'"], 
        styleSrc: ["'self'"], 
        connectSrc: ["'self'"], 
        objectSrc: ["'none'"], 
        frameSrc: ["'none'"], 
        formAction: ["'self'"],
      },
    },
    frameguard: { action: "deny" },
    xssFilter: false,
    noSniff: true,
    hidePoweredBy: true, 
  })
);

app.use(limiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(hpp());
app.use(xss());
app.use('/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
