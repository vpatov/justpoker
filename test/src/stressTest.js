import axios from 'axios';
import get from 'lodash/get';

import { BettingRoundActionType } from '../../ui/src/shared/models/game/betting';
import { getDefaultGameParameters } from '../../ui/src/shared/models/game/game';

import { ClientActionType } from '../../ui/src/shared/models/api/api';

import queryString from 'query-string';
import WebSocket from 'ws';

function generateClientUUID() {
    return 'C_' + generateUUID();
}
function generateUUID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
let httpUrl = 'https://justpoker.games';
// httpUrl = 'http://0.0.0.0:8080'; // uncomment for local

let wsUrl = 'wss://justpoker.games';
// wsUrl = 'ws://0.0.0.0:8080'; // uncomment for local

const api = axios.create({
    baseURL: httpUrl,
});

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const createGameAPI = (data) => {
    const url = '/api/createGame';
    return api.post(url, data);
};

function CreateGame() {
    const defaultParams = getDefaultGameParameters();
    // to make check always valid
    defaultParams.smallBlind = 0;
    defaultParams.bigBlind = 0;
    defaultParams.timeToAct = 5;
    const createReq = {
        gameParameters: defaultParams,
    };

    return createGameAPI(createReq).catch((err) => console.error(err));
}

function openWsForGame(gameInstanceUUID) {
    const clientUUID = generateClientUUID();

    const wsURI = {
        url: wsUrl,
    };

    const openMessage = {
        open: true,
        clientUUID: clientUUID,
        gameInstanceUUID: gameInstanceUUID,
    };
    const ws = new WebSocket(queryString.stringifyUrl(wsURI), []);
    setTimeout(() => ws.send(JSON.stringify(openMessage)), 20);
    function onError(err) {
        console.log('errored: ', get(err, 'error', 'unknown'));
    }
    ws.onerror = onError;

    return { ws: ws, clientUUID: clientUUID, gameInstanceUUID: gameInstanceUUID };
}

function connectPlayers(numPlayers, gameInstanceUUID) {
    const playerWS = [];
    for (let i = 0; i < numPlayers; i++) {
        playerWS.push(openWsForGame(gameInstanceUUID));
    }
    return playerWS;
}

function sitdownPlayersAndStartGame(playerWS) {
    let admin;
    playerWS.forEach(({ ws, clientUUID, gameInstanceUUID }, index) => {
        if (index === 0) admin = { ws, clientUUID, gameInstanceUUID };
        ws.send(
            JSON.stringify({
                clientUUID,
                gameInstanceUUID,
                actionType: ClientActionType.JOINGAMEANDJOINTABLE,
                request: {
                    avatarKey: 'shark',
                    name: `PLAYER ${index}`,
                    buyin: 100,
                    seatNumber: index,
                },
            }),
        );
    });
    const { ws, clientUUID, gameInstanceUUID } = admin;
    ws.send(
        JSON.stringify({
            clientUUID,
            gameInstanceUUID,
            actionType: ClientActionType.STARTGAME,
            request: {},
        }),
    );
}

function playerCheck(player) {
    const { ws, clientUUID, gameInstanceUUID } = player;
    ws.send(
        JSON.stringify({
            clientUUID,
            gameInstanceUUID,
            actionType: ClientActionType.BETACTION,
            request: {
                type: BettingRoundActionType.CHECK,
            },
        }),
    );
}

function checkOnToAct(player) {
    function onGameMessage(msg) {
        const jsonData = JSON.parse(get(msg, 'data', {}));
        const toAct = get(jsonData, 'game.controller.toAct', false);
        if (toAct) {
            playerCheck(player);
        }
    }

    player.ws.onmessage = onGameMessage;
}

const NUM_GAMES = 200;
const NUM_PLAYERS = 9;

async function start() {
    let allTables = [];
    for (let i = 0; i < NUM_GAMES; i++) {
        const res = await CreateGame();
        const gameUUID = get(res, 'data.gameInstanceUUID');
        console.log(`${i + 1}: made game ${gameUUID}`);
        const playerWS = connectPlayers(NUM_PLAYERS, gameUUID);
        allTables.push(playerWS);
    }
    await sleep(1000);

    // join all players, set check on toAct
    for (let i = 0; i < allTables.length; i++) {
        const playersAtTable = allTables[i];
        sitdownPlayersAndStartGame(playersAtTable);
        for (let j = 0; j < playerWS.length; j++) {
            const player = playersAtTable[j];
            checkOnToAct(player);
        }
    }
}

start();
