const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "Tour name to have less than 40 characters"],
      minlength: [10, "Tour name to have more than 10 characters"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      require: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      require: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      require: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message:
          "Difficulty values can only be 'easy', 'medium', or 'difficult'",
      },
    },
    guides: {
      type: Array,
    },
    price: {
      type: Number,
      required: [true, "A Tour Package must have a price"],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    locations: {
      type: Object,
    },
    startLocation: {
      type: Object,
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Document Middleware - Runs before the .save() and .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query Middleware -
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// Aggregation Middleware -
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
