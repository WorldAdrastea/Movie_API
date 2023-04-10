//requires modules
const express = require('express'),
    morgan = require('morgan');

const app = express();

app.use(morgan('common'));
app.use(express.static('public'));


//users
let users = [
    {
        id: 1,
        name: 'Nana',
        favMovie: []
    },
    {
        id: 2,
        name: 'Pat',
        favMovie: ['Morbius']
    },
];
//list of top movies
let movies = [
    {
        'title': 'Puss in Boots: The Last Wish',
        'year': '(2022)',
        'description': 'The third Puss in Boots movie of the series',
        'genre': 'Animation',
        'director': ''
    },
    {
        'title': 'Morbius',
        'year': '(2022)',
        'description': 'Morbius',
        'genre': 'Supernatural',
        'director': ''
    },
    {
        'title': 'Bee Movie',
        'year': '(2007)',
        'description': 'Movie about bees',
        'genre': 'Animation',
        'director': ''
    }
];

//READ

app.get('/', (req,res) => {
    let responseText = 'Welcome!';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText)
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname});
});
//Gets list of movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});
//Gets movies by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie)
    } else {
        res.status(400).send('no such movie')
    }
});
//Gets movies by genre
app.get('/movies/genre/:genreName', (req,res) => {
    const {genreName} = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre')
    }
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});