import { Service } from 'typedi';
import { Card } from '../../../shared/models/cards';
import { Player } from '../../../shared/models/player';
import { GameState } from '../../../shared/models/gameState';
import { BettingRoundStage } from '../../../shared/models/game';
import { GameStateManager } from './gameStateManager';
import {
    Controller,
    cleanController,
    FOLD_BUTTON,
    CHECK_BUTTON,
    BET_BUTTON,
    PREFLOP_SIZING_BUTTONS,
    POSTFLOP_SIZING_BUTTONS,
    NOT_FACING_BET_ACTION_BUTTONS,
} from '../../../shared/models/controller';

@Service()
export class StateTransformService {
    constructor(private readonly gameStateManager: GameStateManager) {}

    transformGameStateToUIState(clientUUID: string, secureGameState: GameState) {
        // need to define translation
        // need to define interfaces for UIState
        // needs to be refactored after types and state are better understood

        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const clientPlayerIsInGame = !!heroPlayer;
        const heroPlayerUUID = heroPlayer ? heroPlayer.uuid : null;
        const board = this.gameStateManager.getBoard();

        const UIState = {
            game: {
                gameStarted: this.gameStateManager.getBettingRoundStage() !== BettingRoundStage.WAITING,
                heroInGame: this.gameStateManager.isPlayerInGame(heroPlayerUUID),
                controller: clientPlayerIsInGame ? this.getUIController(heroPlayer) : cleanController,
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

        console.log(JSON.stringify(UIState));

        return UIState;
    }

    getUIController(heroPlayer: Player): Controller {
        const bettingRoundStage = this.gameStateManager.getBettingRoundStage();
        const controller: Controller = {
            toAct: this.gameStateManager.getCurrentPlayerToAct() === heroPlayer.uuid,
            unsetCheckCall: false,
            min: 0,
            max: heroPlayer.chips,
            pot: this.gameStateManager.getTotalPot(),
            sizingButtons:
                bettingRoundStage === BettingRoundStage.PREFLOP || bettingRoundStage === BettingRoundStage.WAITING
                    ? PREFLOP_SIZING_BUTTONS
                    : POSTFLOP_SIZING_BUTTONS,
            actionButtons: NOT_FACING_BET_ACTION_BUTTONS,
        };

        return controller;
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
            button: this.gameStateManager.getDealerUUID() === player.uuid,
            winner: player.winner,
        };
        return newPlayer;
    }

    getUIState(clientUUID: string) {
        const strippedState = this.stripSensitiveFields(clientUUID);
        const uiState = this.transformGameStateToUIState(clientUUID, strippedState);
        return uiState;
    }
}
