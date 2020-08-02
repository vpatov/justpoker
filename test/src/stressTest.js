import axios from 'axios';
import get from 'lodash/get';

import { getDefaultGameParameters } from '../../ui/src/shared/models/game/game';
import { BettingRoundActionType } from '../../ui/src/shared/models/game/betting';
import { ClientActionType } from '../../ui/src/shared/models/api/api';

import queryString from 'query-string';
import WebSocket from 'ws';

let serverUrl = 'https://justpoker.games';
serverUrl = 'http://0.0.0.0:8080'; // uncomment for local

let wsUrl = 'wss://justpoker.games';
wsUrl = 'ws://0.0.0.0:8080'; // uncomment for local
const api = axios.create({
    baseURL: serverUrl,
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
    const wsURI = {
        url: wsUrl,
        query: {
            clientUUID: null,
            gameInstanceUUID: gameInstanceUUID,
        },
    };
    const ws = new WebSocket(queryString.stringifyUrl(wsURI), []);
    function onError(err) {
        console.log('errored');
    }
    ws.onerror = onError;

    return ws;
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
    playerWS.forEach((ws, index) => {
        if (index === 0) admin = ws;
        ws.send(
            JSON.stringify({
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
    admin.send(
        JSON.stringify({
            actionType: ClientActionType.STARTGAME,
            request: {},
        }),
    );
}

function playerCheck(ws) {
    ws.send(
        JSON.stringify({
            actionType: ClientActionType.BETACTION,
            request: {
                type: BettingRoundActionType.CHECK,
            },
        }),
    );
}

function checkOnToAct(ws) {
    function onGameMessage(msg) {
        const jsonData = JSON.parse(get(msg, 'data', {}));
        const toAct = get(jsonData, 'game.controller.toAct', false);
        if (toAct) {
            playerCheck(ws);
        }
    }

    ws.onmessage = onGameMessage;
}

const NUM_GAMES = 14;
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
