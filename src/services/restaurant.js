// Use a library called axios for the API requests
// Want to create helper file that will set up axios the way we want to work and import it

import http from "../http-common";

// Here, we put all the functions that make API calls and return the information from the API calls
// These are based upon what was specified in restaurants.route.js and the controller files
class RestaurantDataService {
  getAll(page = 0) {
    return http.get(`?page=${page}`);
  }

  get(id) {
    return http.get(`/id/${id}`);
  }

  // By allows you to specify if you are searching by name? zipcode? cuisine?
  find(query, by = "name", page = 0) {
    return http.get(`restaurants?${by}=${query}&page=${page}`);
  }

  createReview(data) {
    return http.post("/review", data);
  }

  updateReview(data) {
    return http.put("/review", data);
  }

  deleteReview(id, userId) {
    return http.delete(`/review?id=${id}`, {
      data: { user_id: userId },
    });
  }

  getCuisines(id) {
    return http.get(`/cuisines`);
  }
}

export default new RestaurantDataService();
