import { Service } from 'typedi';
import {GameState} from '../models/gameState';
import {GameStateManager} from './gameStateManager';

@Service()
export class StateTransformService {

    constructor(private readonly gameStateManager: GameStateManager){}

    transformGameStateToUIState(clientUUID: string, strippedGameState: GameState) {
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const pot = this.gameStateManager.getTotalPot();
        const communityCards = this.gameStateManager.getBoard().cards;

        // need to define translation
        // need to define interfaces for UIState

        /* const { stack, hand, name, toAct, hero, bet, button } = props.player; */

        const UIState = {
            missionControl: {
                heroStack: player.chips,
                pot,
            },
            table: {
                spots: 9,
                pot,
                communityCards,
                players: [] as any[],

            },
        }

        return UIState;

    }

    stripSensitiveFields(clientUUID: string): GameState {
        const connectedClient = this.gameStateManager.getConnectedClient(clientUUID);
        const clientPlayerUUID = connectedClient.playerUUID;

        connectedClient.uuid = 'a';

        const players = Object.fromEntries(Object.entries(this.gameStateManager.getPlayers())
            .map(([uuid, player]) => [
                uuid,
                (uuid === clientPlayerUUID ?
                    player :
                    { ...player, holeCards: [] })
            ]
        ));

        const strippedGameState = {
            ...this.gameStateManager.getGameState(),
            players,
            clientPlayerUUID

        };

        delete strippedGameState.deck;
        delete strippedGameState.table;

        return strippedGameState;
    }


    getUIState(clientUUID: string){
        const strippedState = this.stripSensitiveFields(clientUUID);
        const gsUI = this.transformGameStateToUIState(clientUUID, strippedState);
        return strippedState;
    }


}