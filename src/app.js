// Load Modules
var express = require('express'),    // Loads the Express module
    pug     = require('pug'),        // Loads the PUG templating engine for Express
    Twit    = require('twit'),       // Provides interaction with Twitter API
    config  = require('./config');   // Object literal containing Twitter API access key and token


// Initialise application
var twit = new Twit(config),
    app  = express(),
    httpPort = 3030;

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');


// Default route loads the main template
app.get('/', function (req, res) {
    res.render('main', {port: httpPort});
});

app.get('/demo', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

// Start the Express web server
app.listen(httpPort);
console.log('Express server listening on port ' + httpPort);
