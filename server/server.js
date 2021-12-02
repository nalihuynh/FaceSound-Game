const express = require('express');

const hbs = require('hbs');

const path = require('path');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');
const { getHighScores, submitHighScore } = require('./firestore');

// set up port
const port = process.env.PORT || 3000;

const app = express();
const server = app.listen(port, () => {
    console.log(`Web server up on port ${port}`);
});

// view engine
app.use(express.static(path.join(__dirname, "../public")));

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout:false}));
app.set('view engine', 'hbs');

// middleware
app.use(express.static(__dirname + '../public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('start');
})

app.get('/game', (req,res) => {
    res.render('game');
})

app.post('/game', (req, res) => {
    let name = req.body.name;
    let score = req.body.score;
    console.log(`name: ${name}\nscore: ${score}`);

    // save to firestore database
    submitHighScore(name, score);

    res.end('success');
})

app.get('/leaderboard', (req,res) => { 
    getHighScores().then(listings => {
        res.render('leaderboard', { listings });
    })
})

app.get('/instructions', (req,res) => {
    res.render('instructions');
})