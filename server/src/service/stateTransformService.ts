import { Service } from 'typedi';
import { Card } from '../../../shared/models/cards';
import { Player } from '../../../shared/models/player';
import { GameState } from '../../../shared/models/gameState';
import { BettingRoundStage } from '../../../shared/models/game';
import { GameStateManager } from './gameStateManager';
import {
    Controller,
    cleanController,
    ALL_ACTION_BUTTONS,
    SizingButton,
    COMMON_BB_SIZINGS,
    COMMON_POT_SIZINGS,
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
                    pot: this.gameStateManager.getTotalPot(),
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
        const bbValue = this.gameStateManager.getBB();
        const potSize = this.gameStateManager.getTotalPot();
        console.log('bbvalue, potsize', bbValue, potSize);
        const controller: Controller = {
            toAct: this.gameStateManager.getCurrentPlayerToAct() === heroPlayer.uuid,
            unsetCheckCall: false,
            min: 0,
            max: heroPlayer.chips,
            pot: potSize,
            sizingButtons:
                bettingRoundStage === BettingRoundStage.PREFLOP || bettingRoundStage === BettingRoundStage.WAITING
                    ? COMMON_BB_SIZINGS.map((numBlinds) => this.createBBSizeButton(numBlinds, bbValue))
                    : COMMON_POT_SIZINGS.map(([numerator, denominator]) =>
                          this.createPotSizeButton(numerator, denominator, potSize),
                      ),
            actionButtons: ALL_ACTION_BUTTONS,
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
            stack: player.chips - player.betAmount,
            hand: {
                cards:
                    heroPlayerUUID !== player.uuid ? player.holeCards.map(() => ({ hidden: true })) : player.holeCards,
            },
            name: player.name,
            toAct: this.gameStateManager.getCurrentPlayerToAct() === player.uuid,
            hero: player.uuid === heroPlayerUUID,
            position: player.seatNumber,
            bet: player.betAmount,
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

    createPotSizeButton(numerator: number, denominator: number, potSize: number): SizingButton {
        return {
            label:
                numerator > denominator ? 'Overbet' : numerator === denominator ? 'POT' : `${numerator}/${denominator}`,
            value: Math.floor((numerator / denominator) * potSize),
        };
    }

    createBBSizeButton(numBlinds: number, bbValue: number) {
        return {
            label: `${numBlinds} BB`,
            value: numBlinds * bbValue,
        };
    }
}
