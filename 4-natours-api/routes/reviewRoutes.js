const express = require("express");
const authCon = require("../controllers/authenticationController");
const reviewCon = require("../controllers/reviewController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewCon.getAllReviews)
  .post(
    authCon.protect,
    authCon.restrictTo("user"),
    reviewCon.setTourUserIds,
    reviewCon.createReview
  );

router
  .route("/:id")
  .get(reviewCon.getReview)
  .patch(reviewCon.updateReview)
  .delete(reviewCon.deleteReview);

module.exports = router;
