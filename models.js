const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
  * Mongoose schema for movies
  * @typedef {Object} MovieSchema
  * @property {string} Title - Movie title
  * @property {string} Description - Movie description
  * @property {Object} Genre - Genre information
  * @property {string} Genre.Name - Genre name
  * @property {string} Genre.Description - Genre description
  * @property {Object} Director - Director information
  * @property {string} Director.Name - Director name
  * @property {string} Director.Bio - Director biography
  * @property {string[]} Actors - List of actors
  * @property {string} ImagePath - Path to the movie image
  * @property {boolean} Featured - Indicates if the movie is featured
  */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});

/**
  * Mongoose schema for users
  * @typedef {Object} UserSchema
  * @property {string} Username - User's username
  * @property {string} Password - User's hashed password
  * @property {string} Email - User's email
  * @property {Date} Birthday - User's birthday
  * @property {mongoose.Types.ObjectId[]} FavoriteMovies - List of favorite movie IDs
  */
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

/**
  * Hashes the provided password using bcrypt
  * @function
  * @memberof module:models.UserSchema
  * @param {string} password - User's password to be hashed
  * @returns {string} Hashed password
  */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
  * Validates the provided password against the stored hashed password
  * @function
  * @memberof module:models.UserSchema
  * @param {string} password - User's password to be validated
  * @returns {boolean} True if the provided password is valid, otherwise false
  */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

//Exports Modules
module.exports.Movie = Movie;
module.exports.User = User;
