//requires modules
const express = require('express'),
    app = express()
    bodyParser = require('body-parser'),
    uuid = require('uuid');

app.use(bodyParser.json());

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
        'genre': {
            'name':'Animation',
            'description':'An Animation'
        },
        'director': {
            'name': 'Joel Crawford',
            'bio': 'Joel Crawford is an American storyboard artist and director best known for his work on several DreamWorks Animation films, including The Croods: A New Age and Puss in Boots: The Last Wish. Crawford was born in Minneapolis and raised in Reno, Nevada and Los Angeles.',
            'birth': '1975'
        },
        'imageUrl':'https://www.imdb.com/title/tt3915174/mediaviewer/rm342562561/?ref_=ext_shr_lnk',
        'featured':false
    },
    {
        'title': 'Morbius',
        'year': '(2022)',
        'description': 'Morbius',
        'genre': {
            'name':'Supernatural',
            'description':'Unnatural phenomena',
        },
        'director': {
            'name': 'Daniel Espinosa',
            'bio':'Jorge Daniel Espinosa is a Swedish film director from Trångsund, Stockholm, of Chilean origin.',
            'birth':'1977'
        },
        'imageUrl':'https://www.imdb.com/title/tt5108870/mediaviewer/rm2505970177/?ref_=ext_shr_lnk',
        'featured':false
    },
    {
        'title': 'Bee Movie',
        'year': '(2007)',
        'description': 'Movie about bees',
        'genre': {
            'name':'Animation',
            'description':'An Animation',
        },
        'director': {
            'name':'Simon J. Smith',
            'bio':'Simon James Smith is a British animator, film director, and voice actor. He is best known for his work at DreamWorks Animation. Smith came to PDI/DreamWorks in 1997 as head of layout for the company\'s feature film division.',
            'birth':'1968',
        },
        'imageUrl':'https://www.imdb.com/title/tt0389790/mediaviewer/rm3067186432/?ref_=ext_shr_lnk',
        'featured':false
    }
];

//CREATE
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need names')
    }
})

//UPDATE
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);
    
    if (user) {
        user.name = updatedUser.name;
        res.status(201).json(user);
    } else {
        res.status(400).send('no such user')
    }
})


//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);
    
    if (user) {
        user.favMovie.push(movieTitle)
        res.status(200).send(`${movieTitle} has been added to ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }
})

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);
    
    if (user) {
        user.favMovie = user.favMovie.filter(title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }
})

//DELETE
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find(user => user.id == id);
    
    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).send(`User ${id} has been deleted`);
    } else {
        res.status(400).send('no such user')
    }
})


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
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.genre.name === genreName).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre')
    }
});
//Gets movies by director
app.get('/movies/director/:directorName', (req,res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.director.name === directorName).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such director')
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});