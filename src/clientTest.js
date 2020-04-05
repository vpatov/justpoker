var WebSocket = require('ws');
var cookie = require('cookie');
var request = require('request');

var justPokerCookie = '12345678';

// See if there is a cookie namd "JustPokerCookie" (or whatever you want to call it) present locally already
// if not, generate one and store it

// http://localhost:8080/newgameget?bigBlind=3&smallBlind=1&gameType=NLHOLDEM&password=abc


var queryParams = { bigBlind:3, smallBlind:1, gameType:"NLHOLDEM", password:"abc" };

request({url:'http://localhost:8080/newgameget', qs:queryParams}, function(err, response, body) {
    if(err) { console.log(err); return; }
    var ws = new WebSocket(
        'http://localhost:8080',
        [],
        {
            'headers': {
                'Cookie': cookie.serialize('id', justPokerCookie)
            }
        }
    );

    ws.on('message', (data) => {
        console.log("Server sent: ", data);
    });

    setTimeout(() => {
        ws.send(JSON.stringify(
            {
                actionType: "JoinTable",
                data : {
                    name: "Vasia",
                    buyin: 1000
                }
            }
        ));

    }, 3000);
});






/*
ws.send('{"actionType":"SITDOWN"}')
// example of sitting down (also needs buyin prolly)

ws.send('{"actionType":"BET", "data":{"amount": 50}}')

//server responds with game state, you get the gist
*/