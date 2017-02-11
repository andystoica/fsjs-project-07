// Load Modules
var express = require('express'),    // Loads the Express module
    pug     = require('pug'),        // Loads the PUG templating engine for Express
    Twit    = require('twit'),       // Provides interaction with Twitter API
    config  = require('./config');   // Object literal containing Twitter API access key and token


// Initialise application
var twit = new Twit(config),
    app  = express(),
    httpPort = process.env.PORT || 3030,
    fetchedData = {};

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');




// Fetch data from Twitter API
function fetchData(tweets_count, users_count, messages_count) {
    return new Promise((resolve, reject) => {
        twit.get('account/verify_credentials', {skip_status: true}, (err, data) => {
            // Handle any errors
            if (err) reject(err);
            // Fullfill the promise by returning the user's details
            console.log(data);
            resolve({
                user: {
                    name: data.name,
                    image_url: data.profile_image_url,
                    bg_image_url: data.profile_background_image_url,
                    screen_name: data.screen_name,
                },
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
            // Handle any errors
            if (err) reject(err);
            // Add relevant tweet fields to the dataSet
            dataSet.tweets = [];
            data.forEach(tweet => dataSet.tweets.push({
                created_at: tweet.created_at,
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

function sortMessages(dataSet) {
    return new Promise((resolve, reject) => {
        dataSet.messages = dataSet.messages
            .sort((a,b) => new Date(a.created_at) > new Date(b.created_at))
            .slice(-dataSet.mCount)
            .reverse();

        resolve(dataSet);
    });
}

fetchData(5, 5, 5)
    .then(getTweets)
    .then(getUsers)
    .then(getReceivedMessages)
    .then(getSentMessages)
    .then(sortMessages)
    .then(dataSet => {
        fetchedData = dataSet;
        console.log(fetchedData.messages);
    });


// Default route loads the main template
app.get('/', function (req, res) {
    res.render('main', fetchedData);
});

// Demo route loads the original index.html file for comparison
app.get('/demo', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

// Start the Express web server
app.listen(httpPort);
console.log('Express server listening on port ' + httpPort);
