import { Service } from 'typedi';
import { Card } from '../../../ui/src/shared/models/cards';
import { Player } from '../../../ui/src/shared/models/player';
import { GameState } from '../../../ui/src/shared/models/gameState';
import {
    UiState,
    Player as UIPlayer,
    FOLD_BUTTON,
    CHECK_BUTTON,
    CALL_BUTTON,
    BET_BUTTON,
} from '../../../ui/src/shared/models/uiState';
import { BettingRoundStage } from '../../../ui/src/shared/models/game';
import { GameStateManager } from './gameStateManager';
import { printObj } from '../../../ui/src/shared/util/util';

import {
    Controller,
    cleanController,
    ActionButton,
    ALL_ACTION_BUTTONS,
    SizingButton,
    COMMON_BB_SIZINGS,
    COMMON_POT_SIZINGS,
} from '../../../ui/src/shared/models/uiState';
import { HandSolverService, Hand } from './handSolverService';
import { ValidationService, hasError } from './validationService';

@Service()
export class StateTransformService {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly handSolverService: HandSolverService,
        private readonly validationService: ValidationService,
    ) {}

    // Hero refers to the player who is receiving this particular UiState.
    transformGameStateToUIState(clientUUID: string): UiState {
        // TODO needs to be cleaned up, along with model files

        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const clientPlayerIsInGame = !!heroPlayer;
        const heroPlayerUUID = heroPlayer ? heroPlayer.uuid : '';
        const board = this.gameStateManager.getBoard();

        const uiState: UiState = {
            game: {
                gameStarted: this.gameStateManager.getBettingRoundStage() !== BettingRoundStage.WAITING,
                heroInGame: this.gameStateManager.isPlayerInGame(heroPlayerUUID),
                controller: clientPlayerIsInGame ? this.getUIController(clientUUID, heroPlayerUUID) : cleanController,
                table: {
                    spots: 9, // TODO configure
                    pot: this.gameStateManager.getTotalPot(),
                    communityCards: [...board],
                    players: Object.entries(this.gameStateManager.getPlayers()).map(([uuid, player]) =>
                        this.transformPlayer(player, heroPlayerUUID),
                    ),
                },
            },
        };
        return uiState;
    }

    getUIController(clientUUID: string, heroPlayerUUID: string): Controller {
        const bettingRoundStage = this.gameStateManager.getBettingRoundStage();
        const bbValue = this.gameStateManager.getBB();
        const potSize = this.gameStateManager.getTotalPot();
        const controller: Controller = {
            toAct: this.gameStateManager.getCurrentPlayerToAct() === heroPlayerUUID,
            unsetCheckCall: false,
            min: 0,
            max: this.gameStateManager.getPlayer(heroPlayerUUID).chips,
            sizingButtons:
                bettingRoundStage === BettingRoundStage.PREFLOP || bettingRoundStage === BettingRoundStage.WAITING
                    ? COMMON_BB_SIZINGS.map((numBlinds) => this.createBBSizeButton(numBlinds, bbValue))
                    : COMMON_POT_SIZINGS.map(([numerator, denominator]) =>
                          this.createPotSizeButton(numerator, denominator, potSize),
                      ),
            actionButtons: this.getValidBetActions(clientUUID, heroPlayerUUID),
            adminButtons: [],
        };

        return controller;
    }

    // TODO
    getValidBetActions(clientUUID: string, heroPlayerUUID: string): ActionButton[] {
        const currentPlayerToAct = this.gameStateManager.getCurrentPlayerToAct();
        if (currentPlayerToAct !== heroPlayerUUID) {
            return [];
        }
        const actionButtons = [];
        let response = this.validationService.validateFoldAction(clientUUID);
        console.log(response);
        if (!hasError(response)) {
            actionButtons.push(FOLD_BUTTON);
        }
        response = this.validationService.validateCheckAction(clientUUID);
        console.log(response);

        if (!hasError(response)) {
            actionButtons.push(CHECK_BUTTON);
        }
        response = this.validationService.validateCallAction(clientUUID);
        console.log(response);

        if (!hasError(response)) {
            actionButtons.push(CALL_BUTTON);
        }
        /* TODO - create generic bet action that can be used here, or augment
            validation code path to allow for checking whether a bet is possible
        if (!hasError(this.validationService.validateBetAction(clientUUID,null))){
            actionButtons.push(BET_BUTTON);
        }
        */

        actionButtons.push(BET_BUTTON);
        return actionButtons;
    }

    transformPlayer(player: Player, heroPlayerUUID: string): UIPlayer {
        const board = this.gameStateManager.getBoard();

        const isHero = heroPlayerUUID === player.uuid;
        const shouldCardsBeVisible = isHero || !player.cardsAreHidden;
        const toAct = this.gameStateManager.getCurrentPlayerToAct() === player.uuid;
        const newPlayer = {
            stack: player.chips - player.betAmount,
            hand: {
                cards: shouldCardsBeVisible ? player.holeCards : player.holeCards.map(() => ({ hidden: true })),
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

    getUIState(clientUUID: string): UiState {
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

    createBBSizeButton(numBlinds: number, bbValue: number): SizingButton {
        return {
            label: `${numBlinds} BB`,
            value: numBlinds * bbValue,
        };
    }
}
