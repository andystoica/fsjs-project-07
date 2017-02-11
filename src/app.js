// Load Modules
var express = require('express'),    // Loads the Express module
    pug     = require('pug'),        // Loads the PUG templating engine for Express
    Twit    = require('twit'),       // Provides interaction with Twitter API
    config  = require('./config');   // Object literal containing Twitter API access key and token


// Initialise application
var twit = new Twit(config),
    app  = express(),
    httpPort = process.env.PORT || 3030;

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');




// Fetch data from Twitter API
function fetchData(tweets_count, users_count, messages_count) {
    return new Promise((resolve, reject) => {
        twit.get('account/verify_credentials', {skip_status: true}, (err, data) => {
            if (err) reject(err);
            resolve({
                user_name: data.user_name,
                user_image: data.profile_image_url,
                user_bg_image: data.profile_background_image_url,
                user_screen: data.screen_name,
                tCount: tweets_count,
                uCount: users_count,
                mCount: messages_count
            });
        });
    });
}


function getTweets(dataSet) {
    return new Promise((resolve, reject) => {
        twit.get('statuses/user_timeline', {count: dataSet.tCount}, (err, data) => {
            if (err) reject(err);
            dataSet.tweets = [];
            data.forEach(tweet => dataSet.tweets.push({
                created_at: tweet.created_at,
                text: tweet.text,
                user_name: tweet.user.name,
                user_screen: tweet.user.screen_name,
                user_image: tweet.user.profile_image_url,
                retweet_count: tweet.retweet_count,
                favorite_count: tweet.favorite_count
            }));
            resolve(dataSet);
        });
    });
}

function getUsers(dataSet) {
    return new Promise((resolve, reject) => {
        twit.get('friends/list', {count: dataSet.uCount}, (err, data) => {
            if (err) reject(err);
            dataSet.users = [];
            data.users.forEach(user => dataSet.users.push({
                user_name: user.name,
                user_screen: user.screen_name,
                user_image: user.profile_image_url,
                user_following: user.following
            }));
            resolve(dataSet);
        });
    });
}

function getMessages(dataSet) {
    return new Promise((resolve, reject) => {
        twit.get('direct_messages', {screen_name: dataSet.screen, count: dataSet.mCount}, (err, data) => {
            if (err) reject(err);
            dataSet.messages = [];
            data.forEach(message => dataSet.messages.push({
                created_at: message.created_at,
                user_name: message.sender.name,
                user_screen: message.sender.screen_name,
                user_image: message.sender.profile_image_url,
                text: message.text
            }));
            resolve(dataSet);
        });
    });
}

fetchData(5, 5, 5)
    .then(getTweets)
    .then(getUsers)
    .then(getMessages)
    .then(function(dataSet) {
        console.log('--- Tweets ---\n', dataSet.tweets);
        console.log('--- Users ---\n', dataSet.users);
        console.log('--- Messages ---\n', dataSet.messages);
    });





// Default route loads the main template
app.get('/', function (req, res) {
    res.render('main', {port: httpPort});
});

// Demo route loads the original index.html file for comparison
app.get('/demo', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

// Start the Express web server
app.listen(httpPort);
console.log('Express server listening on port ' + httpPort);
