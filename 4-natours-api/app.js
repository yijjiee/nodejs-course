const express = require("express");
const morgan = require("morgan");

const AppError = require("./utils/appError");
const ErrorController = require("./controllers/errorController");
const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);

const app = express();

// Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

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
