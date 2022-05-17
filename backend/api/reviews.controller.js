import ReviewsDAO from "../dao/reviewsDAO.js";

export default class ReviewsController {
  static async apiPostReview(req, res, next) {
    try {
      // Before, we were getting information from the query parameter. Now, we're getting information from the body
      const restaurantId = req.body.restaurant_id;
      const review = req.body.text;
      const userInfo = {
        name: req.body.name,
        _id: req.body.user_id,
      };
      const date = new Date();

      // ReviewsDAO will send this to the database
      await ReviewsDAO.addReview(restaurantId, userInfo, review, date);
      res.json({ status: "success" }); // Returns success if it works (note how this doesn't need the return keyword)
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiUpdateReview(req, res, next) {
    try {
      const reviewId = req.body.review_id; // Need id so that we can change the actual review
      const text = req.body.text;
      const date = new Date();

      // In the delete and post requests, didn't need to create a reference to ReviewsDAO.updateReview
      // Here, we do it so that we can later on check if the modifiedCount === 0
      const reviewResponse = await ReviewsDAO.updateReview(
        reviewId,
        req.body.user_id, // Need user id so that we can check the same user who is trying to modify review is the user who created the review
        text,
        date
      );

      var { error } = reviewResponse; // This is coming from return {error: e} in the updateReview function
      if (error) {
        res.status(400).json({ error });
      }

      if (reviewResponse.modifiedCount === 0) {
        throw new Error(
          "unable to update review - user may not be original poster"
        );
      }

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiDeleteReview(req, res, next) {
    try {
      // A little different because we're getting id from the query
      // Why? because this is a delete api request and usually delete requests use queries instead of bodies I am assuming
      const reviewId = req.query.id;
      const userId = req.body.user_id; // Non standard to have a body in the delete request
      // This is a simple version of authentication, nothing you would do in a production environment
      await ReviewsDAO.deleteReview(reviewId, userId);
      // TODO: Crrently there is a bug where it will say success even if you haven't deleted the review properly
      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}
