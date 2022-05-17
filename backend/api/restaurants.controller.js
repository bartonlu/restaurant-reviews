import RestaurantsDAO from "../dao/restaurantsDAO.js";

// When this API is called through a URL, there might be a query string so we can specify certain parameters
export default class RestaurantsController {
  static async apiGetRestaurants(req, res, next) {
    // restaurantsPerPage will be one of the query strings
    // We make it equal to whatever value is passed in through the URL. We check if this value
    // exists by doing req.query.restaurantsPerPage
    // The req.query property is an object containing the property for each query string parameter in the route.
    // req.query is from EXPRESS
    const restaurantsPerPage = req.query.restaurantsPerPage
      ? parseInt(req.query.restaurantsPerPage, 10)
      : 20;
    const page = req.query.page ? parseInt(req.query.page, 10) : 0;

    let filters = {};
    if (req.query.cuisine) {
      filters.cuisine = req.query.cuisine;
    } else if (req.query.zipcode) {
      filters.zipcode = req.query.zipcode;
    } else if (req.query.name) {
      filters.name = req.query.name;
    }

    // getRestaurants was created in restaurantsDAO.js
    const { restaurantsList, totalNumRestaurants } =
      await RestaurantsDAO.getRestaurants({
        filters,
        page,
        restaurantsPerPage,
      });

    // Create a response to respond when this API is called
    let response = {
      restaurants: restaurantsList,
      page: page,
      filters: filters,
      entries_per_page: restaurantsPerPage,
      total_results: totalNumRestaurants,
    };
    res.json(response); // Send json response with all this info to whoever navigates to URL
    // The res.json() function sends a JSON response. This method sends a response (with the correct
    // content-type) that is the parameter converted to a JSON string using the JSON.stringify() method.
    // This line actaully gets the JSON to appear on the page or on Postman
  }
  static async apiGetRestaurantById(req, res, next) {
    try {
      let id = req.params.id || {}; // A parameter is something written after the URL as a slash
      let restaurant = await RestaurantsDAO.getRestaurantByID(id);

      // Note that in the try block, you can still handle errors - here, a 404 is handled because the request occurred,
      // but nothing was returned since the restuarant doesn't exist. Whereas in the catch block, there was some sort
      // of issue on the server side in handling the request.

      // The 500 Internal Server Error is a very general HTTP status code that means something has gone wrong on the web
      // site's server but the server could not be more specific on what the exact problem is.
      // More on the function of try and catch blocks here: https://beginnersbook.com/2013/04/try-catch-in-java/
      if (!restaurant) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(restaurant);
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetRestaurantCuisines(req, res, next) {
    try {
      let cuisines = await RestaurantsDAO.getCuisines();
      res.json(cuisines);

      // No need for a 404 here since there will definitely be cuisines here
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }
}
