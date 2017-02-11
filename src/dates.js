'use strict';

var data = [ { created_at: 'Sat Feb 11 09:19:23 +0000 2017',
    text: 'Busy day at work so my hour was spent playing with @arduino. So much fun lighting up LEDs with code :) #100DaysOfCode',
    user:
     { name: 'Andy Stoica',
       screen_name: 'andystoica',
       image_url: 'http://pbs.twimg.com/profile_images/706365228787826689/Q1Y9cs7I_normal.jpg' },
    retweets: 0,
    favorites: 2 },
  { created_at: 'Sun Jan 08 19:00:07 +0000 2017',
    text: '#100DaysOfCode 4 / 100 Worked on FSJS Techdegree @treehouse plus Katas to keep the streak going',
    user:
     { name: 'Andy Stoica',
       screen_name: 'andystoica',
       image_url: 'http://pbs.twimg.com/profile_images/706365228787826689/Q1Y9cs7I_normal.jpg' },
    retweets: 1,
    favorites: 3 },
  { created_at: 'Sat Jan 07 14:23:23 +0000 2017',
    text: 'Day 3 of #100DaysOfCode relaxing Saturday on https://t.co/Uq5XCNoK28.',
    user:
     { name: 'Andy Stoica',
       screen_name: 'andystoica',
       image_url: 'http://pbs.twimg.com/profile_images/706365228787826689/Q1Y9cs7I_normal.jpg' },
    retweets: 0,
    favorites: 4 },
  { created_at: 'Fri Jan 06 17:14:11 +0000 2017',
    text: 'Another day, another project. https://t.co/mkEO9IpsAi Playing with JSON, XHR and type ahead content filtering.  #100DaysOfCode Day 2. Done.',
    user:
     { name: 'Andy Stoica',
       screen_name: 'andystoica',
       image_url: 'http://pbs.twimg.com/profile_images/706365228787826689/Q1Y9cs7I_normal.jpg' },
    retweets: 0,
    favorites: 1 },
  { created_at: 'Fri Jan 06 16:42:30 +0000 2017',
    text: 'Proud to be the 31,743rd backer on @BackerKit for Font Awesome 5 | Thx @fontawesome! https://t.co/Mrt4WyWzxq',
    user:
     { name: 'Andy Stoica',
       screen_name: 'andystoica',
       image_url: 'http://pbs.twimg.com/profile_images/706365228787826689/Q1Y9cs7I_normal.jpg' },
    retweets: 0,
    favorites: 1 } ];


function formatTimeStamp(str) {
    let month  = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'.split('|'),
        date   = new Date(str),
        delta  = Date.now() - date,
        hours  = delta / 3600000,
        output = '';

    if (hours <  1) return 'not long ago';
    if (hours <  2) return '1 hour ago';
    if (hours < 24) return Math.floor(hours) + ' hours ago';
    return date.getDate() + ' ' + month[date.getMonth()] + ' ' + date.getFullYear();
}


data.forEach(el => {
    console.log(formatTimeStamp(el.created_at));
});
