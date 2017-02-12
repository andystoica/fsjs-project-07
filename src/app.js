'use strict';

// Load Modules
var express    = require('express'),      // Loads the Express module
    bodyParser = require('body-parser'),  // Loads the Body-Parser module
    pug        = require('pug'),          // Loads the PUG templating engine for Express
    Twit       = require('twit'),         // Provides interaction with Twitter API
    config     = require('./config');     // Object literal containing Twitter API access key and token


// Initialise application
var twit = new Twit(config),
    app  = express(),
    httpPort = process.env.PORT || 3030;

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));



//--------------------------------
// Web Server and route management
//--------------------------------


// Default route loads the main template
app.get('/', function (req, res) {
    fetchData()
        .then(dataSet => {
            res.render('main', dataSet);
        })
        .catch(err => { res.redirect('/error') });
});

// Posts a new tweet to user account
app.post('/', function (req, res) {
    // If tweet is not empty, send the API call and reload
    if (req.body.tweet)
        postTweet(req.body.tweet)
            .then(tweet => { res.redirect('/') })
            .catch(err => { res.redirect('/error') });
    else
        res.redirect('/');
});

// Error route loads the error message
app.get('/error', function (req, res) {
    res.render('error');
});

// Start the Express web server
app.listen(httpPort, function() {
    console.log('Express server listening on port ' + httpPort);
});




//-------------------------------
// Fetching data from Twitter API
//-------------------------------

function fetchData() {
    return new Promise((resolve, reject) => {
        let fetchedData = {};

        getUserDetails()
            .then(getTweets)
            .then(getUsers)
            .then(getReceivedMessages)
            .then(getSentMessages)
            .then(sortMessages)
            .then(dataSet => {
                resolve(dataSet);
            })
            .catch(err => {
                reject(err);
            });
    });
}

/**
 * Get user profile details
 */
function getUserDetails() {
    return new Promise((resolve, reject) => {
        twit.get('account/verify_credentials', {skip_status: true}, (err, data) => {
            // Handle any errors
            if (err) reject(err);
            // Fullfill the promise by returning the user's details
            resolve({
                user: {
                    name: data.name,
                    image_url: data.profile_image_url,
                    bg_image_url: data.profile_banner_url,
                    screen_name: data.screen_name,
                },
                tCount: 5,
                uCount: 5,
                mCount: 5
            });
        });
    });
}

/**
 * Get last user status messages (tweets)
 */
function getTweets(dataSet) {
    return new Promise((resolve, reject) => {
        twit.get('statuses/user_timeline', {count: dataSet.tCount}, (err, data) => {
            // Handle any errors
            if (err) reject(err);
            // Add relevant tweet fields to the dataSet
            dataSet.tweets = [];
            data.forEach(tweet => dataSet.tweets.push({
                created_at: formatTimeStamp(tweet.created_at),
                text: tweet.text,
                user: {
                    name: tweet.user.name,
                    screen_name: tweet.user.screen_name,
                    image_url: tweet.user.profile_image_url,
                },
                retweets: tweet.retweet_count,
                favorites: tweet.favorite_count
            }));
            // Fulfill the promise by returning the dataSet
            resolve(dataSet);
        });
    });
}

/**
 * Post a new status message (tweet) on the user timeline
 */
function postTweet(tweet) {
    return new Promise((resolve, reject) => {
        twit.post('statuses/update', {status: tweet}, (err, data) => {
            // Handle any errors
            if (err) reject(err);
            // Resolve the promise
            resolve(tweet);
        });
    });
}

/**
 * Get last few friends
 */
function getUsers(dataSet) {
    return new Promise((resolve, reject) => {
        twit.get('friends/list', {count: dataSet.uCount}, (err, data) => {
            // Handle any errors
            if (err) reject(err);
            // Add relevant user fields to the dataSet
            dataSet.users = [];
            data.users.forEach(user => dataSet.users.push({
                name: user.name,
                screen_name: user.screen_name,
                image_url: user.profile_image_url,
                following: user.following
            }));
            // Fulfill the promise by returning the dataSet
            resolve(dataSet);
        });
    });
}

/**
 * Get last sent direct messages
 */
function getSentMessages(dataSet) {
    return new Promise((resolve, reject) => {
        twit.get('direct_messages/sent', {screen_name: dataSet.screen, count: dataSet.mCount}, (err, data) => {
            // Handle any errors
            if (err) reject(err);
            // Add relevant message fields to the dataSet
            dataSet.messages = dataSet.messages || [];
            data.forEach(message => dataSet.messages.push({
                created_at: message.created_at,
                user: {
                    name: message.sender.name,
                    screen_name: message.sender.screen_name,
                    image_url: message.sender.profile_image_url,
                },
                text: message.text
            }));
            // Fulfill the promise by returning the dataSet
            resolve(dataSet);
        });
    });
}

/**
 * Get last received direct messages
 */
function getReceivedMessages(dataSet) {
    return new Promise((resolve, reject) => {
        twit.get('direct_messages', {screen_name: dataSet.screen, count: dataSet.mCount}, (err, data) => {
            // Handle any errors
            if (err) reject(err);
            // Add relevant message fields to the dataSet
            dataSet.messages = dataSet.messages || [];
            data.forEach(message => dataSet.messages.push({
                created_at: message.created_at,
                user: {
                    name: message.sender.name,
                    screen_name: message.sender.screen_name,
                    image_url: message.sender.profile_image_url,
                },
                text: message.text
            }));
            // Fulfill the promise by returning the dataSet
            resolve(dataSet);
        });
    });
}

/**
 * Combine, sort and trim the list of direct messages
 */
function sortMessages(dataSet) {
    return new Promise((resolve, reject) => {
        dataSet.messages = dataSet.messages
            .sort((a, b) => new Date(a.created_at) > new Date(b.created_at))
            .slice(-dataSet.mCount)
            .reverse();
        dataSet.messages
            .forEach(el => el.created_at = formatTimeStamp(el.created_at));
        resolve(dataSet);
    });
}



//---------
// Utilties
//---------

/**
 * Formats time interval to user friendly readout
 */
function formatTimeStamp(str) {
    let month  = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'.split('|'),
        date   = new Date(str),
        delta  = Date.now() - date,
        hours  = delta / 3600000,
        mins   = delta / 60000,
        output = '';

    if (mins  <  1) return 'just now';
    if (mins  < 60) return Math.floor(mins) + ' minutes ago';
    if (hours <  2) return '1 hour ago';
    if (hours < 24) return Math.floor(hours) + ' hours ago';
    return date.getDate() + ' ' + month[date.getMonth()] + ' ' + date.getFullYear();
}
