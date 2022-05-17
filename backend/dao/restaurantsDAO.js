// All mongodb db methods can be found here: https://www.mongodb.com/docs/manual/reference/method/js-collection/

import mongodb from "mongodb";
const ObjectId = mongodb.ObjectID;
// We want access to ObjectID - this is used to convert a string to a mongodb objectID

let restaurants; // Creating a variable that we can use a reference to our database

// First of all, note that DAO means document access object
export default class RestaurantsDAO {
  // injectDB is how we initially connect to our database, call this as soon as server starts
  // As soon as the server starts, this gets a reference to the restaurants database
  static async injectDB(conn) {
    // If reference to database already exists, return
    if (restaurants) {
      return;
    }
    try {
      restaurants = await conn
        .db(process.env.RESTREVIEWS_NS)
        .collection("restaurants");
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in restaurantsDAO: ${e}`
      );
    }
  }

  static async getRestaurants({
    filters = null,
    page = 0,
    restaurantsPerPage = 20,
  } = {}) {
    let query;
    // Queries in mongodb are really powerful
    if (filters) {
      if ("name" in filters) {
        // Text searches are different from the others. This is saying that for anywhere in the string
        // we are going to search for the name. It knows which field to search in order to get the name
        // passed in because it is set up in mongoDB atlas
        query = { $text: { $search: filters["name"] } };
      } else if ("cuisine" in filters) {
        // This query is saying, if cuisine is in the filters that are passed, then
        // make the cuisine equal to the specific cuisine passed. Cuisine (and also
        // address.zipcode) are database fields
        query = { cuisine: { $eq: filters["cuisine"] } };
      } else if ("zipcode" in filters) {
        query = { "address.zipcode": { $eq: filters["zipcode"] } };
      }
    }

    let cursor;
    /* "Cursors are used by database programmers to process individual rows returned by database system queries. 
    Cursors enable manipulation of whole result sets at once. In this scenario, a cursor enables the 
    sequential processing of rows in a result set." */

    try {
      cursor = await restaurants.find(query); // The Cursor is a MongoDB Collection of the document which is returned upon the find method execution.
    } catch (e) {
      console.error(`Unable to issue find command ${e}`);
      return { restaurantsList: [], totalNumRestaurants: 0 };
    }

    // This limit + skip chain is a clever way to limit the number of restaurants per page
    const displayCursor = cursor
      .limit(restaurantsPerPage)
      .skip(restaurantsPerPage * page);

    try {
      const restaurantsList = await displayCursor.toArray();
      // To get number of restaurants, there is a handy .countDocuments function
      const totalNumRestaurants = await restaurants.countDocuments(query);
      return { restaurantsList, totalNumRestaurants };
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`
      );
      return { restaurantsList: [], totalNumRestaurants: 0 };
    }
  }

  static async getRestaurantByID(id) {
    try {
      // Creating a pipeline - Mongodb aggregation pipeline
      // Aggregation pipeline is a framework for data aggregation modelled on the concept of data processing pipelines
      // Documents enter a multistage pipeline that transfers the documents into aggregated results
      // A good feature of mongodb is that you can create pipelines that help match different collections together
      // More information on mongodb pipelines: https://www.mongodb.com/docs/manual/reference/operator/
      const pipeline = [
        {
          // $match filters the documents to pass only the documents that match the specified condition(s) to the next pipeline stage.
          // $match takes a document that specifies the query conditions.
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          // Look up items like the reviews, which we can add to the result of this function
          $lookup: {
            from: "reviews",
            // Let is an expression defining variables to use in the pipeline stage. This is how you access fields
            // from the input collection in the pipeline stage.
            let: {
              id: "$_id", // In reviews.controller, we defined the variable name as _id in the database
            },
            // Create another pipeline that matches restaurant id and reviews together
            pipeline: [
              {
                // Match stage of pipeline
                $match: {
                  /** Behavior
                      $expr can build query expressions that compare fields from the same document in a $match stage. (We are not doing that here,
                      since we are comparing fields in two different collections. That means they cannot be the same document )

                      If the $match stage is part of a $lookup stage, $expr can compare fields using let variables. This is what we are doing.
                      (See Specify Multiple Join Conditions with $lookup for an example.)
                      
                      $expr only uses indexes on the from collection for equality matches in a $match stage. 
                      
                      What is an index?
                      
                      An index in MongoDB is a special data structure that holds the data of few fields of documents on which the index is created.
                   * Indexes improve the speed of search operations in database because instead of searching the whole document, the search is
                   * performed on the indexes that holds only few fields.**/

                  $expr: {
                    $eq: ["$restaurant_id", "$$id"], // Here we're accessing id from let - note how we're using "id" and not "_id"
                    // $$ refers to variable defined in let
                    // $ refers to fields in the foreign collection (a foreign collection is defined as the collection you want
                    // to join with, and a local collection is the collection you are running the query on. )
                  },
                },
              },
              // Optional group stage of pipeline (not implemented here)
              {
                // Sort stage of pipeline, sorts documents (-1 is descending), and returns sorted documents
                $sort: {
                  date: -1,
                },
              },
            ],
            as: "reviews", // Set the output array field to be reviews
          },
        },
        {
          // Adds a field called reviews
          $addFields: {
            reviews: "$reviews",
          },
        },
      ];
      return await restaurants.aggregate(pipeline).next(); // .next returns the next item which is the restaurant with all reviews connected
    } catch (e) {
      console.error(`Something went wrong in getRestaurantByID: ${e}`);
      throw e;
    }
  }

  static async getCuisines() {
    let cuisines = [];
    try {
      cuisines = await restaurants.distinct("cuisine"); // Get all distinct cuisines
      return cuisines;
    } catch (e) {
      console.error(`Unable to get cuisines, ${e}`);
      return cuisines;
    }
  }
}
