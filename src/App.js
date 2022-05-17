import React from "react";
import { Routes, Route, Link } from "react-router-dom"; // Use to create different url routes
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap used to style app

import AddReview from "./components/add-review";
import Restaurant from "./components/restaurant";
import RestaurantsList from "./components/restaurants-list";
import Login from "./components/login";

function App() {
  // Make a user state variable
  const [user, setUser] = React.useState(null);

  // Dummy login system, doesn't save user to database
  const login = async (user = null) => {
    setUser(user);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <div>
      {/* Navbar is from bootstrap documentation */}
      {/** These are bootstrap classes used to style */}
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        {/* Brand part of navbar*/}
        <a href="/" className="navbar-brand">
          Restaurant Reviews
        </a>
        {/* Navigation part of navbar */}
        <div className="navbar-nav mr-auto">
          <li className="nav-item">
            {/* <Link/> comes from react-router and routes to a different url. Difference between Link and Route is that Route
             is used to actually specify what should render, whereas Link is there to specify what the text "Restaurants" should
             link to */}
            <Link to={"/restaurants"} className="nav-link">
              Restaurants
            </Link>
          </li>
          {/* The login/logout button looks different depending on if the user is defined */}
          <li className="nav-item">
            {user ? (
              <a
                onClick={logout} // runs a logout function
                className="nav-link"
                style={{ cursor: "pointer" }}
              >
                Logout {user.name}
              </a>
            ) : (
              <Link to={"/login"} className="nav-link">
                Login
              </Link>
            )}
          </li>
        </div>
      </nav>

      {/* This is the rest of the page. Note that Switch was replaced with Routes. Routes allows you to switch between pages */}
      <div className="container mt-3">
        <Routes>
          {/* Whatever component is passed into "element" is the one that is loaded 
        
        Also, react router does partial matching. So in order to make it so that going to /restaurants/:id or 
        any other paths doesn't go to "/", we need to say exact path so that it only goes
        to a path if it matches exactly*/}
          <Route exact path={"/"} element={RestaurantsList} />
          <Route
            path="/restaurants/:id/review" // Access id variable from component
            // Reason for using render instead of component here - allows us to pass in props later
            render={<AddReview ser={user} />}
          />
          <Route path="/restaurants/:id" render={<Restaurant user={user} />} />
          <Route path="/login" render={<Login login={login} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
