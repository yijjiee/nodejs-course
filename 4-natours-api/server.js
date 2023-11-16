const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION OCCURED! 💥 Shutting down...");
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });
const app = require("./app");

const port = process.env.PORT || 3000;
const connectionString = process.env.DB_CONNECTION_STRING.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);

mongoose.connect(connectionString).then(() => {
  console.log("Database connected successfully!");
});

// Start server
const server = app.listen(port, () => {
  console.log(`App is listening on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION OCCURED! 💥 Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
