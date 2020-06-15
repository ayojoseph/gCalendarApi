var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var app = express();

const TOKEN_PATH = 'token.json';
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var calendar;
var events;
var sEvents = [];
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
    authorize(JSON.parse(content), listEvents);
});


function authorize(creds, callback) {
    const {client_secret, client_id, redirect_uris} = creds.installed;

    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
};


function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function listEvents(auth) {
    calendar = google.calendar({version: 'v3', auth});
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        events = res.data.items;
        if (events.length) {
            console.log('You have ' + events.length + ' upcoming events.');
            shortenEvents();
        } else {
            console.log('No upcoming events found.');
        }
    });
}


app.get('/', function (req, res, next) {
    res.send('Getter');
});

app.post('/getcal', function (req, res, next) {
    res.send('GetCal');
});

app.get('/getevents', function (req, res) {
    try {
        getCalendarEvents();
        res.status(200).send({events,count: events.length});
    } catch (e) {
        res.status(500).send('Server Error: ' + e);
    }
});

app.get('/geteventshort', function (req, res) {
    try {
        getCalendarEvents(false);
        res.status(200).send({sEvents, count: events.length});
    } catch (e) {
        res.status(500).send('Server Error: ' + e);
    }
});


function getCalendarEvents() {
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        events = res.data.items;
        if (events.length) {
           shortenEvents();
        } else {
            console.log('No upcoming events found.');
        }
    });
}
function shortenEvents(){
  sEvents  = [];
  events.map((event, i) => {
    const start = event.start.dateTime || event.start.date;
    const end = event.end.dateTime || event.end.date;
    const name = event.summary; 
    sEvents.push({start: start, end: end, name: name});
  });
}


module.exports = app;
