//requires modules
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//Mongoose intergration with REST API
mongoose.connect('mongodb://127.0.0.1:27017/MoviesAPI', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

//READ
app.get('/', (req,res) => {
  let responseText = 'Welcome to the myFlix application!'
  res.send(responseText)
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname});
});

// Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Gets list of movies
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.errror(err);
      res.status(500).send("Error: " + err);
    });
});

//Gets movies by title
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title})
  .then((movie) => {
    if (!movie) {
      return res.status(404).send('Error: ' + req.params.title + ' was not found');
    }
    res.status(201).json(movie);
  })
  .catch((err) => {
    console.errror(err);
    res.status(500).send("Error: " + err);
  });
});

//Gets movies by genre
app.get('/movies/genre/:genreName', (req,res) => {
  Movies.find({ 'Genre.Name': req.params.genreName })
    .then((movies) => {
      if (movies.length == 0) {
        return res.status(401).send('no such genre')
      } else {
        res.status(200).json(movies);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Gets movies by director
app.get('/movies/director/:directorName', (req,res) => {
  Movies.find({ 'Director.Name': req.params.directorName })
    .then((movies) => {
      if (movies.length == 0) {
        return res.status(404).send('Error: No such director')
      } else {
        res.status(200).json(movies);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//CREATE
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

//UPDATE
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, 
      { $set:
        {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        },
    },
    { new: true }, // This line makes sure that the updated document is returned
    )
    .then((user) => {
      if (!user) {
        return res.status(404).send('Error: No user was found');
      } else {
        res.json(user);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

//CREATE
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username},
    { $addToSet: { FavoriteMovies: req.params.MovieID },
    },
    { new: true}
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send('Error: User not found');
      } else { 
        res.json(updatedUser);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//DELETE
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username},
    { 
      $pull: {FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      if(!updatedUser) {
        return res.status(404).send('Error: User not found');
      } else {
        res.json(updatedUser);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//DELETE Delete a user by username
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});