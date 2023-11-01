/**
 * Requires modules
 */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const uuid = require("uuid");
const dotenv = require("dotenv"); 
const mongoose = require("mongoose");
const Models = require("./models.js");

const { check, validationResult } = require("express-validator");

/**
  * Movie and User models
  * @typedef {import("./models.js").MovieModel} MovieModel
  * @typedef {import("./models.js").UserModel} UserModel
  */
const Movies = Models.Movie;
const Users = Models.User;
dotenv.config();

//Mongoose intergration with REST API
const connect = async () => { 
  try { 
  await mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB: ');
 } catch (error) {
    console.error(error);
  }
};    

connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "https://git.heroku.com/movies-guide.git",
  "http://testsite.com",
  "http://localhost:1234",
  "https://myflixmovieapplication.netlify.app",
  "http://localhost:4200",
  "https://3.95.24.165",
  "http://reactbucketachievement1-1.7.s3-website.eu-west-2.amazonaws.com"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
let auth = require("./auth.js")(app);

const passport = require("passport");
require("./passport.js");

/**
 * Read
 */
app.get("/", (req, res) => {
  let responseText = "Welcome to the myFlix application!";
  res.send(responseText);
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

/**
  * Route handler for getting all users
  * @name GET /users
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {function} middleware - Passport middleware
  * @param {function} handler - Express route handler
  */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
  * Route handler for getting a user by username
  * @name GET /users/:Username
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {function} middleware - Passport middleware
  * @param {function} handler - Express route handler
  */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
  * Route handler for getting movies from API
  * @name GET /movies
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {function} middleware - Passport middleware
  * @param {function} handler - Express route handler
  */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.errror(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
  * Route handler for getting a movie by title
  * @name GET /movies/:title
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {function} middleware - Passport middleware
  * @param {function} handler - Express route handler
  */
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        if (!movie) {
          return res
            .status(404)
            .send("Error: " + req.params.title + " was not found");
        }
        res.status(201).json(movie);
      })
      .catch((err) => {
        console.errror(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
  * Route handler for getting movies by genre
  * @name GET /movies/genre/:genreName
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {function} middleware - Passport middleware
  * @param {function} handler - Express route handler
  */
app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ "Genre.Name": req.params.genreName })
      .then((movies) => {
        if (movies.length == 0) {
          return res.status(401).send("no such genre");
        } else {
          res.status(200).json(movies);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
  * Route handler for getting movies by director
  * @name GET /movies/director/:directorName
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {function} middleware - Passport middleware
  * @param {function} handler - Express route handler
  */
app.get(
  "/movies/director/:directorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ "Director.Name": req.params.directorName })
      .then((movies) => {
        if (movies.length == 0) {
          return res.status(404).send("Error: No such director");
        } else {
          res.status(200).json(movies);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
  * Route handler for creating a new user
  * @name POST /users
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {array} middleware - Express middleware array for validation
  * @param {function} handler - Express route handler
  */
app.post(
  "/users",
  //Validation logic
  [
    check("Username", "Username is required").isLength({ min: 4 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    //Check the Validation Object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
  * Route handler for updating a user's information
  * @name PUT /users/:Username
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {function} middleware - Passport middleware
  * @param {Array<Validator>} validators - Array of express-validator middleware functions
  * @param {function} handler - Express route handler
  */
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 4 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true } // This line makes sure that the updated document is returned
    )
      .then((user) => {
        if (!user) {
          return res.status(404).send("Error: No user was found");
        } else {
          res.json(user);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
  * Route handler for adding a movie to a user's favorite list
  * @name POST /users/:Username/movies/:MovieID
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {array} middleware - Express middleware array for authentication
  * @param {function} handler - Express route handler
  */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $addToSet: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send("Error: User not found");
        } else {
          res.json(updatedUser);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
  * Route handler for removing a movie from a user's favorite list
  * @name DELETE /users/:Username/movies/:MovieID
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {array} middleware - Express middleware array for authentication
  * @param {function} handler - Express route handler
  */
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send("Error: User not found");
        } else {
          res.json(updatedUser);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
  * Route handler for deleting a user by username
  * @name DELETE /users/:Username
  * @function
  * @memberof module:app
  * @inner
  * @param {string} path - Express route path
  * @param {array} middleware - Express middleware array for authentication
  * @param {function} handler - Express route handler
  */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
  * Error handler middleware
  * @function
  * @memberof module:app
  * @param {Error} err - The error object
  * @param {Request} req - The Express request object
  * @param {Response} res - The Express response object
  * @param {function} next - The next middleware function
  */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

/**
  * Port configuration
  * @type {number}
  */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
