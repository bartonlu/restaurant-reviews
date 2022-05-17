import mongodb from "mongodb";
const ObjectId = mongodb.ObjectID;
// We want access to ObjectID - this is used to convert a string to a mongodb objectID

let reviews; // Fill with reference to reviews collection

export default class ReviewsDAO {
  // This is similar to injectDB with RestaurantsDAO, we use this to
  // initially connect to our database, and we call this as soon as server starts as well
  // As soon as server starts, we want to get a reference to reviews database
  static async injectDB(conn) {
    if (reviews) {
      return;
    }
    try {
      reviews = await conn.db(process.env.RESTREVIEWS_NS).collection("reviews");
      // Great thing about MongoDB - it's okay if a db or collection does not exist already - it is automatically created if it doesn't exist yet
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`);
    }
  }

  static async addReview(restaurantId, user, review, date) {
    try {
      const reviewDoc = {
        name: user.name,
        user_id: user._id,
        date: date,
        text: review,
        restaurant_id: ObjectId(restaurantId), // Note the MongoDB object ID
      };
      return await reviews.insertOne(reviewDoc); // Reviews is a reference to the database
    } catch (e) {
      console.error(`Unable to post review: ${e}`);
      return { error: e };
    }
  }

  static async updateReview(reviewId, userId, text, date) {
    try {
      const updateResponse = await reviews.updateOne(
        // Below is a document. A document is whatever you want to insert into the collection. The document argument is required.
        { user_id: userId, _id: ObjectId(reviewId) }, // Looking for a review that has the right userid and reviewID

        { $set: { text: text, date: date } }
        // The $set operator replaces the value of a field with the specified value.
        // The $set operator expression has the following form: { $set: { <field1>: <value1>, ... } }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update review: ${e}`);
      console.log("is this running");
      return { error: e };
    }
  }

  static async deleteReview(reviewId, userId) {
    try {
      const deleteResponse = await reviews.deleteOne({
        _id: ObjectId(reviewId),
        user_id: userId,
      });

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to delete review: ${e}`);
      return { error: e };
    }
  }
}
