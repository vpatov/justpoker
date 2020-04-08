const WebSocket = require('ws');
const cookie = require('cookie');
const request = require('request');

const justPokerCookie1 = '12345678';
const justPokerCookie2 = 'abcdefgh';

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

// See if there is a cookie namd "JustPokerCookie" (or whatever you want to call it) present locally already
// if not, generate one and store it

// http://localhost:8080/newgameget?bigBlind=3&smallBlind=1&gameType=NLHOLDEM&password=abc

const queryParams = { bigBlind: 3, smallBlind: 1, gameType: 'NLHOLDEM', password: 'abc' };

request({ url: 'http://localhost:8080/newgameget', qs: queryParams }, function (err, response, body) {
    if (err) {
        console.log(err);
        return;
    }
    const ws1 = new WebSocket('http://localhost:8080', [], {
        headers: {
            Cookie: cookie.serialize('id', justPokerCookie1),
        },
    });

    const ws2 = new WebSocket('http://localhost:8080', [], {
        headers: {
            Cookie: cookie.serialize('id', justPokerCookie2),
        },
    });

    ws1.on('message', (data) => {
        console.log('Player 1 receives:');
        try {
            obj = JSON.parse(data);
            console.log(obj.players[obj.clientPlayerUUID].holeCards);
        } catch (e) {
            console.log(data);
        }
    });

    ws2.on('message', (data) => {
        console.log('Player 2 receives:');

        try {
            obj = JSON.parse(data);
            console.log(obj.players[obj.clientPlayerUUID].holeCards);
        } catch (e) {
            console.log(data);
        }
    });

    setTimeout(() => {
        ws1.send(
            JSON.stringify({
                actionType: 'JOINTABLE',
                data: {
                    name: 'Vasia1',
                    buyin: 1000,
                },
            }),
        );
    }, 200);

    setTimeout(() => {
        ws2.send(
            JSON.stringify({
                actionType: 'JOINTABLE',
                data: {
                    name: 'Vasia2',
                    buyin: 2000,
                },
            }),
        );
    }, 400);

    setTimeout(() => {
        ws1.send(
            JSON.stringify({
                actionType: 'SITDOWN',
                data: {
                    seatNumber: 0,
                },
            }),
        );
    }, 600);

    setTimeout(() => {
        ws2.send(
            JSON.stringify({
                actionType: 'SITDOWN',
                data: {
                    seatNumber: 1,
                },
            }),
        );
    }, 800);

    setTimeout(() => {
        ws1.send(
            JSON.stringify({
                actionType: 'STARTGAME',
            }),
        );
    }, 1000);

    function prompt() {
        console.log('executing prompt');
        readline.question('Command: ', (data) => {
            if (data === 'exit') {
                return readline.close();
            }

            [number, action] = data.split(',');
            if (action.toUpperCase() === 'CHECK') {
                (number === '1' ? ws1 : ws2).send(JSON.stringify({ actionType: 'CHECK' }));
            }

            prompt(); //Calling this function again to ask new question
        });
    }

    setTimeout(prompt, 1200);
});

/*
ws.send('{"actionType":"SITDOWN"}')
// example of sitting down (also needs buyin prolly)

ws.send('{"actionType":"BET", "data":{"amount": 50}}')

//server responds with game state, you get the gist
*/
