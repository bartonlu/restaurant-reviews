import app from "./server.js";
import dotenv from "dotenv"; // Helps you access your env variables
import mongodb from "mongodb";
import restaurantsDAO from "./dao/restaurantsDAO.js";
import ReviewsController from "./api/reviews.controller.js";
import ReviewsDAO from "./dao/reviewsDAO.js";
dotenv.config(); // Loads in the variables
const MongoClient = mongodb.MongoClient; // Creating mongoclient

const port = process.env.PORT || 8000;

// Actually connect to the database - connecting requires the database URI
// Also need to pass in the options for accessing the database
// .connect returns a reference to the database. .then uses in its callback function
MongoClient.connect(process.env.RESTREVIEWS_DB_URI, {
  maxPoolSize: 50,
  wtimeoutMS: 2500, // Time it takes for a request to timeout
  useNewUrlParser: true,
})
  .catch((err) => {
    // err.stack offers a trace of which functions were called, in what order,
    // from which line and file, and with what arguments.
    console.log(err.stack);
    process.exit(1); // The line of code for terminating a node process
  })
  .then(async (client) => {
    // After we connect, before we start the server, we call injectDB
    // InjectDB gets you a reference to the database
    await restaurantsDAO.injectDB(client);
    await ReviewsDAO.injectDB(client);
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
    // Starting the webserver is only one part of it, we also need to make the routes
  });
