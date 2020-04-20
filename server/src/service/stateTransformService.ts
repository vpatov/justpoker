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
    START_GAME_BUTTON,
    STOP_GAME_BUTTON,
    ADD_CHIPS_BUTTON,
} from '../../../ui/src/shared/models/uiState';
import { BettingRoundStage } from '../../../ui/src/shared/models/game';
import { GameStateManager } from './gameStateManager';
import { AudioService } from './audioService';

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
import { AudioQueue } from '../../../ui/src/shared/models/audioQueue';

@Service()
export class StateTransformService {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly handSolverService: HandSolverService,
        private readonly validationService: ValidationService,
        private readonly audioService: AudioService,
    ) {}

    // Hero refers to the player who is receiving this particular UiState.
    transformGameStateToUIState(clientUUID: string): UiState {
        // TODO the way that heroPlayer / clientPlayerIsInGame is handled is a little complicated
        // and should be refactored
        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const clientPlayerIsInGame = !!heroPlayer;
        const heroPlayerUUID = heroPlayer ? heroPlayer.uuid : '';
        const board = this.gameStateManager.getBoard();

        const uiState: UiState = {
            game: {
                gameStarted: this.gameStateManager.getBettingRoundStage() !== BettingRoundStage.WAITING,
                heroInGame: clientPlayerIsInGame,
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
            audio: clientPlayerIsInGame
                ? this.transformAudioForClient(heroPlayerUUID)
                : this.audioService.getAudioQueue(),
        };
        return uiState;
    }

    getUIController(clientUUID: string, heroPlayerUUID: string): Controller {
        const bettingRoundStage = this.gameStateManager.getBettingRoundStage();
        const bbValue = this.gameStateManager.getBB();
        const potSize = this.gameStateManager.getTotalPot();
        const toAct = this.gameStateManager.getCurrentPlayerToAct() === heroPlayerUUID;
        const controller: Controller = {
            toAct,
            unsetCheckCall: false,
            min: 0,
            max: this.gameStateManager.getPlayer(heroPlayerUUID).chips,
            sizingButtons: !toAct
                ? []
                : bettingRoundStage === BettingRoundStage.PREFLOP || bettingRoundStage === BettingRoundStage.WAITING
                ? COMMON_BB_SIZINGS.map((numBlinds) => this.createBBSizeButton(numBlinds, bbValue))
                : COMMON_POT_SIZINGS.map(([numerator, denominator]) =>
                      this.createPotSizeButton(numerator, denominator, potSize),
                  ),
            actionButtons: this.getValidBetActions(clientUUID, heroPlayerUUID),
            adminButtons: this.getValidAdminButtons(clientUUID),
        };

        return controller;
    }

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

        //  TODO - create generic bet action that can be used here, or augment
        //     validation code path to allow for checking whether a bet is possible
        // if (!hasError(this.validationService.validateBetAction(clientUUID,null))){
        actionButtons.push(BET_BUTTON);
        // }

        return actionButtons;
    }

    getValidAdminButtons(clientUUID: string): ActionButton[] {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        // TODO if (client.admin)

        const adminButtons = [];
        adminButtons.push(this.gameStateManager.shouldDealNextHand() ? STOP_GAME_BUTTON : START_GAME_BUTTON);
        adminButtons.push(ADD_CHIPS_BUTTON);
        return adminButtons;
    }

    transformAudioForClient(playerUUID: string): AudioQueue {
        const winners = this.gameStateManager.getWinners();
        if (winners.length > 0) {
            if (winners.includes(playerUUID)) {
                // TODO check chip delta for big player win
                return this.audioService.getHeroWinSFX();
            } else {
                return this.audioService.getVillainWinSFX();
            }
        }
        /* TODO this approach isn't working exactly as intended because right now
         there is no delay between a player action, and the resultant state.
         for example, a player bets. Their bet, and the next
         player to act, are part of the same state update. It would be probably be 
         better for timing/sounds/animations if there was a slight delay in between
         player actions and the next person to act. i.e.
         player bets - updated state with their bet gets sent
         next player to act - the state that immediately follows
         this way the sound for when someone bets and when its someones turn 
         are part of different states and are easier to handle.
        */
        // if (this.gameStateManager.getCurrentPlayerToAct() === playerUUID) {
        //     return this.audioService.getHeroTurnToActSFX();
        // } else {
        //     return this.audioService.getAudioQueue();
        // }
        return this.audioService.getAudioQueue();
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
                      timeElapsed: this.gameStateManager.getCurrentPlayerTurnElapsedTime() / 1000,

                      // subtract one second such that the server timer ends just a little bit after
                      // the visual component of the UI indicates that the turn is over, to compensate
                      // and prevent from the vice-versa scenario (which would be way worse)
                      timeLimit: this.gameStateManager.getTimeToAct() / 1000 - 1,
                  }
                : undefined,
            handLabel: shouldCardsBeVisible && player.holeCards.length > 0 ? player.handDescription : undefined,
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
