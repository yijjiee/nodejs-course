const express = require("express");
const tourCon = require("../controllers/tourController");
const authCon = require("../controllers/authenticationController");
const reviewRouter = require("../routes/reviewRoutes");

const router = express.Router();
// router.param("id", checkID);

// Nester router
router.use("/:tourId/reviews", reviewRouter);

router
  .route("/top-5-cheap-tours")
  .get(tourCon.aliasTopTours, tourCon.getAllTours);
router.route("/tour-stats").get(tourCon.getTourStats);
router.route("/monthly-plan/:year").get(tourCon.getMonthlyPlan);

router
  .route("/")
  .get(authCon.protect, tourCon.getAllTours)
  .post(tourCon.createTour);
router
  .route("/:id")
  .get(tourCon.getTour)
  .patch(
    authCon.protect,
    authCon.restrictTo("admin", "lead-guide"),
    tourCon.updateTour
  )
  .delete(
    authCon.protect,
    authCon.restrictTo("admin", "lead-guide"),
    tourCon.deleteTour
  );

module.exports = router;
