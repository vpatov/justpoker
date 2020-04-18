import { Service } from 'typedi';
import { Card } from '../../../ui/src/shared/models/cards';
import { Player } from '../../../ui/src/shared/models/player';
import { GameState } from '../../../ui/src/shared/models/gameState';
import { BettingRoundStage } from '../../../ui/src/shared/models/game';
import { GameStateManager } from './gameStateManager';
import { printObj } from '../../../ui/src/shared/util/util';

import {
    Controller,
    cleanController,
    ALL_ACTION_BUTTONS,
    SizingButton,
    COMMON_BB_SIZINGS,
    COMMON_POT_SIZINGS,
} from '../../../ui/src/shared/models/controller';
import { HandSolverService, Hand } from './handSolverService';

@Service()
export class StateTransformService {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly handSolverService: HandSolverService,
    ) {}

    transformGameStateToUIState(clientUUID: string) {
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
                    spots: 9, // TODO configure
                    mainPot: 0,
                    pot: this.gameStateManager.getTotalPot(),
                    totalPot: this.gameStateManager.getTotalPot(), // TODO display multiple pots
                    communityCards: board,
                    players: Object.entries(this.gameStateManager.getPlayers()).map(([uuid, player]) =>
                        this.transformPlayer(player, heroPlayerUUID),
                    ),
                },
            },
        };
        return UIState;
    }

    getUIController(heroPlayer: Player): Controller {
        const bettingRoundStage = this.gameStateManager.getBettingRoundStage();
        const bbValue = this.gameStateManager.getBB();
        const potSize = this.gameStateManager.getTotalPot();
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
            adminButtons: [],
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
        const board = this.gameStateManager.getBoard();

        const isHero = heroPlayerUUID === player.uuid;
        const shouldCardsBeVisible = isHero || !player.cardsAreHidden;
        const toAct = this.gameStateManager.getCurrentPlayerToAct() === player.uuid;
        const newPlayer = {
            stack: player.chips - player.betAmount,
            hand: {
                cards: shouldCardsBeVisible ? player.holeCards : player.holeCards.map(() => 'hiddenCard'),
            },
            playerTimer: toAct
                ? {
                      timeElapsed: this.gameStateManager.getTimeTurnElapsedSeconds(),
                      timeLimit: this.gameStateManager.getTimeToAct(),
                  }
                : undefined,
            handLabel:
                shouldCardsBeVisible && player.holeCards.length > 0
                    ? // TODO calculate at the beginning of each street and save to player obj rather
                      // than recalculating every single time someone does anything
                      this.handSolverService.computeBestHandFromCards([...board, ...player.holeCards]).name
                    : undefined,
            name: player.name,
            hidden: isHero ? false : player.cardsAreHidden,
            toAct: toAct,
            hero: player.uuid === heroPlayerUUID,
            position: player.seatNumber,
            bet: player.betAmount,
            button: this.gameStateManager.getDealerUUID() === player.uuid,
            winner: player.winner,
            folded: this.gameStateManager.hasPlayerFolded(player.uuid),
        };
        return newPlayer;
    }

    getUIState(clientUUID: string) {
        const uiState = this.transformGameStateToUIState(clientUUID);
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
