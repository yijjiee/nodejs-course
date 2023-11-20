const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const AppError = require("./utils/appError");
const ErrorController = require("./controllers/errorController");
const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);

const app = express();

// Global Middleware
// 14 security headers - refer to https://www.npmjs.com/package/helmet if needed
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limiting requests (Helps to manage Brute Force DOS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again in a minute",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Testing middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Mounting Routers
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`URL cannot be found (${req.originalUrl})!`, 404));
});

app.use(ErrorController);

module.exports = app;
