import util from "util";
import Location from 'history';
import { GameState } from "../models/gameState";
import { WSParams, EndPoint, HTTPParams } from "../models/dataCommunication";
import queryString from "query-string";

export function generateUUID(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function printObj(obj: any) {
  console.log(util.inspect(obj, false, null, true));
}

// Returns a random integer between min (inclusive) and max (inclusive)
export function genRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function logGameState(gameState: GameState) {
  console.log('\n\nServer game state:\n');
  const minimizedGameState = {
      ...gameState,
      // table: {
      //     uuid: gameState.table.uuid,
      //     activeConnections: [...gameState.table.activeConnections.entries()].map(([uuid, client]) => [
      //         {
      //             ...client,
      //             ws: 'ommittedWebSocket',
      //         },
      //     ]),
      // },
      table: undefined as any,
      board: undefined as any,
      // gameParameters: undefined as string,
      // board: undefined as string,

      deck: [] as any,
  };
  console.log(util.inspect(minimizedGameState, false, null, true));
}


export function parseHTTPParams(location: Location){
  const queryParams = queryString.parse(location.search);
  const endpoint = queryString.parseUrl(location.pathname);
}

export function parseWSParams(parsedQuery: queryString.ParsedUrl){
  const queryParams: WSParams = {
    clientUUID: parsedQuery.query.clientUUID as string,
    gameUUID: parsedQuery.query.gameUUID as string,
    endpoint: parsedQuery.query.endpoint as EndPoint,
  };
  return queryParams;
}