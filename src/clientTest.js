var WebSocket = require('ws');
var cookie = require('cookie');
var request = require('request');

var justPokerCookie1 = '12345678';
var justPokerCookie2 = 'abcdefgh';

// See if there is a cookie namd "JustPokerCookie" (or whatever you want to call it) present locally already
// if not, generate one and store it

// http://localhost:8080/newgameget?bigBlind=3&smallBlind=1&gameType=NLHOLDEM&password=abc


var queryParams = { bigBlind:3, smallBlind:1, gameType:"NLHOLDEM", password:"abc" };

request({url:'http://localhost:8080/newgameget', qs:queryParams}, function(err, response, body) {
    if(err) { console.log(err); return; }
    var ws1 = new WebSocket(
        'http://localhost:8080',
        [],
        {
            'headers': {
                'Cookie': cookie.serialize('id', justPokerCookie1)
            }
        }
    );

    var ws2 = new WebSocket(
        'http://localhost:8080',
        [],
        {
            'headers': {
                'Cookie': cookie.serialize('id', justPokerCookie2)
            }
        }
    );

    ws1.on('message', (data) => {
        console.log("Server sent: ", data);
    });

    ws2.on('message', (data) => {
        console.log("Server sent: ", data);
    });

    setTimeout(() => {
        ws1.send(JSON.stringify(
            {
                actionType: "JoinTable",
                data : {
                    name: "Vasia1",
                    buyin: 1000
                }
            }
        ));

    }, 1000);

        setTimeout(() => {
        ws2.send(JSON.stringify(
            {
                actionType: "JoinTable",
                data : {
                    name: "Vasia2",
                    buyin: 2000
                }
            }
        ));

    }, 1500);

    setTimeout(() => {
        ws1.send(JSON.stringify(
            {
                actionType: "SitDown",
                data : {
                    seatNumber: 0
                }
            }
        ));

    }, 2000);

    setTimeout(() => {
        ws2.send(JSON.stringify(
            {
                actionType: "SitDown",
                data : {
                    seatNumber: 1
                }
            }
        ));

    }, 2500);
});






/*
ws.send('{"actionType":"SITDOWN"}')
// example of sitting down (also needs buyin prolly)

ws.send('{"actionType":"BET", "data":{"amount": 50}}')

//server responds with game state, you get the gist
*/