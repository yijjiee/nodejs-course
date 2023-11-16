const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");

dotenv.config({ path: `./config.env` });

const connectionString = process.env.DB_CONNECTION_STRING.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);

mongoose.connect(connectionString).then(() => {
  console.log("Database connected successfully!");
});

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8")
);

// IMPORT DATA TO DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Data successfully imported!");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Data successfully deleted!");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
  process.exit();
}
