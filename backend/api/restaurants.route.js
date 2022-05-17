import express from "express";
import RestaurantsCtrl from "./restaurants.controller.js";
import ReviewsCtrl from "./reviews.controller.js";
// All of the API calls exist here

// Access to express router
const router = express.Router();

// Our first route - originally written as this: (req, res) => res.send("hello world").
router.route("/").get(RestaurantsCtrl.apiGetRestaurants);
// More documentation on how router.get works with express: https://expressjs.com/en/guide/routing.html

// Get list of all the reviews associated with restaurant
// Get a specific restaurant with a specific id. Note the colon
router.route("/id/:id").get(RestaurantsCtrl.apiGetRestaurantById);

router.route("/cuisines").get(RestaurantsCtrl.apiGetRestaurantCuisines); // Get a list of cuisines
// Allow user from front end to select a cuisine from a dropdown menu

// Note how several API requests are in one route
router
  .route("/review")
  .post(ReviewsCtrl.apiPostReview)
  // Originally I accidentally wrote .all instead of .put, which caused a delete request to be processed like an update
  // That mistake didn't produce an error because the object was still defined, it's just that its properties were not
  .put(ReviewsCtrl.apiUpdateReview)
  .delete(ReviewsCtrl.apiDeleteReview);

// Note how we don't have a route for getting a single review, that's because we get all
// reviews for one restaurant using router.route("/id/:id").get...

export default router;
