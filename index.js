const express = require('express'),
    morgan = require('morgan');

const app = express();

app.use(morgan('common'));
app.use(express.static('public'));

let topMovies = [
    {
        title: 'Puss in Boots: The Last Wish',
        year: '(2022)'
    },
    {
        title: 'Morbius',
        year: '(2022)'
    },
    {
        title: 'Bee Movie',
        year: '(2007)'
    }
];

app.get('/', (req,res) => {
    let responseText = 'Welcome!';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText)
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname});
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});