import { Service } from 'typedi';
import { Card } from '../../../shared/models/cards';
import { Player } from '../../../shared/models/player';
import { GameState } from '../../../shared/models/gameState';
import { BettingRoundStage } from '../../../shared/models/game';
import { GameStateManager } from './gameStateManager';

@Service()
export class StateTransformService {
    constructor(private readonly gameStateManager: GameStateManager) {}

    transformGameStateToUIState(clientUUID: string, secureGameState: GameState) {
        // need to define translation
        // need to define interfaces for UIState
        // needs to be refactored after types and state are better understood

        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const heroPlayerUUID = heroPlayer ? heroPlayer.uuid : null;
        const board = this.gameStateManager.getBoard();

        const UIState = {
            game: {
                gameStarted: this.gameStateManager.getBettingRoundStage() !== BettingRoundStage.WAITING,
                missionControl: heroPlayer ? this.getMissionControl(heroPlayer) : {},
                table: {
                    spots: 9,
                    pot: 0,
                    communityCards: board,
                    players: Object.entries(secureGameState.players).map(([uuid, player]) =>
                        this.transformPlayer(player, heroPlayerUUID),
                    ),
                },
            },
        };

        return UIState;
    }

    getMissionControl(player: Player) {
        return {
            heroStack: player.chips,
            pot: this.gameStateManager.getTotalPot(),
        };
    }

    // TODO (players might want to show their hand)
    // TODO should table be in state?
    stripSensitiveFields(clientUUID: string): GameState {
        const connectedClient = this.gameStateManager.getConnectedClient(clientUUID);
        const clientPlayerUUID = connectedClient.playerUUID;

        // const players = Object.fromEntries(
        //     Object.entries(this.gameStateManager.getPlayers()).map(([uuid, player]) => [
        //         uuid,
        //         uuid === clientPlayerUUID ? player : { ...player, holeCards: [] },
        //     ]),
        // );

        const strippedGameState = {
            ...this.gameStateManager.getGameState(),
            clientPlayerUUID,
        };

        delete strippedGameState.deck;
        delete strippedGameState.table;

        return strippedGameState;
    }

    transformPlayer(player: Player, heroPlayerUUID: string) {
        const newPlayer = {
            stack: player.chips,
            hand: {
                cards:
                    heroPlayerUUID !== player.uuid ? player.holeCards.map(() => ({ hidden: true })) : player.holeCards,
            },
            name: player.name,
            toAct: this.gameStateManager.getCurrentPlayerToAct() === player.uuid,
            hero: player.uuid === heroPlayerUUID,
            position: player.seatNumber,
            bet: player.lastAction ? player.lastAction.amount : 0,
            button: this.gameStateManager.getDealerUUID() === heroPlayerUUID,
            winner: player.winner,
        };
        console.log(player, heroPlayerUUID, newPlayer);
        return newPlayer;
    }

    getUIState(clientUUID: string) {
        const strippedState = this.stripSensitiveFields(clientUUID);
        const uiState = this.transformGameStateToUIState(clientUUID, strippedState);
        return uiState;
    }
}
