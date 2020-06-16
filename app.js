var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const fs = require('fs');
const apiFunctions = require('./api_functions');
var app = express();



// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


fs.readFile('credentials.json', (err, content) => {
    if (err) {
        console.log("Error: " + err);
    }
    apiFunctions.authorize(JSON.parse(content), apiFunctions.listEvents);
});


app.get('/', function (req, res, next) {
    res.send('Getter');
});

app.post('/getcal', function (req, res, next) {
    res.send('GetCal');
});

app.get('/getevents', function (req, res) {
    try {
        apiFunctions.getCalendarEvents();
        res.status(200).send({events,count: events.length});
    } catch (e) {
        res.status(500).send('Server Error: ' + e);
    }
});

app.get('/geteventshort', function (req, res) {
    try {
        apiFunctions.getCalendarEvents(false);
        res.status(200).send({sEvents, count: events.length});
    } catch (e) {
        res.status(500).send('Server Error: ' + e);
    }
});





module.exports = app;
