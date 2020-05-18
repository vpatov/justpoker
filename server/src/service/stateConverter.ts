import { Service } from 'typedi';
import { Card } from '../../../ui/src/shared/models/cards';
import { Player } from '../../../ui/src/shared/models/player';
import { GameState, ServerStateKey, GameStage } from '../../../ui/src/shared/models/gameState';

import {
    UiState,
    UiPlayer,
    FOLD_BUTTON,
    CHECK_BUTTON,
    CALL_BUTTON,
    BET_BUTTON,
    START_GAME_BUTTON,
    STOP_GAME_BUTTON,
    ADMIN_BUTTON,
    SETTINGS_BUTTON,
    VOLUME_BUTTON,
    UiChatMessage,
    BettingRoundActionButton,
    UiCard,
    MenuButton,
    LEDGER_BUTTON,
} from '../../../ui/src/shared/models/uiState';
import { BettingRoundStage, GameType } from '../../../ui/src/shared/models/game';
import { GameStateManager } from './gameStateManager';
import { AudioService } from './audioService';

import {
    Global,
    Controller,
    getCleanController,
    ActionButton,
    SizingButton,
    COMMON_BB_SIZINGS,
    COMMON_POT_SIZINGS,
} from '../../../ui/src/shared/models/uiState';
import { ValidationService, hasError } from './validationService';
import { AudioQueue, SoundByte } from '../../../ui/src/shared/models/audioQueue';
import { MessageService } from './messageService';
import { AnimationService } from './animationService';

import { ChatService } from './chatService';

declare interface CardInformation {
    hand: {
        cards: UiCard[];
    };
    handLabel: string;
}

@Service()
export class StateConverter {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly chatService: ChatService,
    ) {}

    gameUpdated(): boolean {
        return this.gameStateManager.getUpdatedKeys().has(ServerStateKey.GAMESTATE);
    }

    audioUpdated(): boolean {
        return this.gameStateManager.getUpdatedKeys().has(ServerStateKey.AUDIO);
    }

    chatUpdated(): boolean {
        return this.gameStateManager.getUpdatedKeys().has(ServerStateKey.CHAT);
    }

    // Hero refers to the player who is receiving this particular UiState.
    transformGameStateToUIState(clientUUID: string, sendAll: boolean): UiState {
        // TODO the way that heroPlayer / clientPlayerIsInGame is handled is a little complicated
        // and should be refactored
        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const clientPlayerIsSeated = heroPlayer?.sitting;
        const heroPlayerUUID = heroPlayer ? heroPlayer.uuid : '';
        const board = this.gameStateManager.getBoard();

        // TODO put each key into its own function
        const uiState: UiState = {
            game:
                this.gameUpdated() || sendAll
                    ? {
                          global: this.getUIGlobal(clientUUID),
                          controller: clientPlayerIsSeated
                              ? this.getUIController(clientUUID, heroPlayerUUID)
                              : getCleanController(),
                          table: {
                              spots: 9, // TODO configure
                              activePot:
                                  this.gameStateManager.getGameStage() === GameStage.SHOW_WINNER
                                      ? 0
                                      : this.gameStateManager.getActivePotValue(),
                              awardPots: this.gameStateManager.getAwardPots(),
                              fullPot: this.gameStateManager.getFullPot(),
                              inactivePots:
                                  this.gameStateManager.getGameStage() === GameStage.SHOW_WINNER
                                      ? []
                                      : this.gameStateManager.getInactivePotsValues(),
                              communityCards: this.transformCommunityCards(),
                          },
                          players: Object.entries(this.gameStateManager.getPlayers()).map(([uuid, player]) =>
                              this.transformPlayer(player, heroPlayerUUID),
                          ),
                          menu: this.getValidMenuButtons(clientUUID),
                      }
                    : undefined,
            audio: this.audioUpdated() || sendAll ? this.transformAudioForPlayer(heroPlayerUUID) : undefined,
            animation: this.animationService.getAnimationTrigger(),
            // TODO refactor to send entire chatlog on init.
            chat: this.chatUpdated() || sendAll ? this.transformChatMessage() : undefined,
        };
        return uiState;
    }

    getUIGlobal(clientUUID: string): Global {
        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const clientPlayerIsSeated = heroPlayer?.sitting;
        const gameStage = this.gameStateManager.getGameStage();

        const global: Global = {
            isGameInProgress: this.gameStateManager.isGameInProgress(),
            heroIsAdmin: this.gameStateManager.isPlayerAdmin(clientUUID),
            heroIsSeated: clientPlayerIsSeated,
            bigBlind: this.gameStateManager.getBB(),
            smallBlind: this.gameStateManager.getSB(),
            allowStraddle: this.gameStateManager.getAllowStraddle(),
            gameType: this.gameStateManager.getGameType(),
            canStartGame: heroPlayer ? this.gameStateManager.canPlayerStartGame(heroPlayer?.uuid) : false,
            gameWillStopAfterHand: this.gameStateManager.gameWillStopAfterHand(),
            unqueueAllBettingRoundActions:
                gameStage === GameStage.INITIALIZE_NEW_HAND || gameStage === GameStage.FINISH_BETTING_ROUND,
        };

        return global;
    }

    // TODO determine preconditions for when this is called. Is this function called for every player,
    // and returns an unpopulated controller for when its not the players turn? Or is this function
    // only called for the current player to act? Whatever the choice is, the usage/parameters have
    // to be made consistent with the decision, because there is some redundancy right now.
    getUIController(clientUUID: string, heroPlayerUUID: string): Controller {
        const hero = this.gameStateManager.getPlayer(heroPlayerUUID);

        const bettingRoundStage = this.gameStateManager.getBettingRoundStage();
        const bbValue = this.gameStateManager.getBB();
        const fullPot = this.gameStateManager.getFullPot();
        const curBet = this.gameStateManager.getPreviousRaise();
        const curCall = hero.betAmount;
        const toAct =
            this.gameStateManager.getCurrentPlayerToAct() === heroPlayerUUID &&
            this.gameStateManager.gameIsWaitingForBetAction();
        const minBet = this.getMinimumBetSize(heroPlayerUUID);
        const maxBet = this.getMaxBetSizeForPlayer(heroPlayerUUID);

        const getSizingButtons = () => {
            if (!this.gameStateManager.isGameInProgress()) {
                return [];
            }

            const minBetButton = this.createMinBetButton(minBet);
            const allInButton = this.createAllInButton(maxBet);

            if (bettingRoundStage === BettingRoundStage.PREFLOP || bettingRoundStage === BettingRoundStage.WAITING) {
                // normal preflop sizings
                const bbButtons = this.createBBSizeButtons(bbValue, minBet);
                return [minBetButton, ...bbButtons, allInButton];
            } else {
                const potButtons = this.createPotSizeButtons(fullPot, curBet, curCall, minBet);
                return [minBetButton, ...potButtons, allInButton];
            }
        };

        const controller: Controller = {
            toAct,
            lastBettingRoundAction: this.gameStateManager.getLastBettingRoundAction(),
            min: minBet,
            max: maxBet,
            sizingButtons: getSizingButtons(),
            bettingRoundActionButtons: this.getValidBettingRoundActions(clientUUID, heroPlayerUUID),
            dealInNextHand: !hero.sittingOut,
            willStraddle: hero.willStraddle,
            timeBanks: hero.timeBanksLeft,
            showWarningOnFold: !this.gameStateManager.isPlayerFacingBet(heroPlayerUUID),
        };

        return controller;
    }

    getMaxBetSizeForPlayer(playerUUID: string) {
        return this.gameStateManager.getGameType() === GameType.PLOMAHA
            ? this.gameStateManager.getMaxPotLimitBetSize()
            : this.gameStateManager.getPlayer(playerUUID).chips;
    }

    disableButton(button: BettingRoundActionButton) {
        return { ...button, disabled: true };
    }

    getValidBettingRoundActions(clientUUID: string, heroPlayerUUID: string): BettingRoundActionButton[] {
        if (!this.gameStateManager.isGameInProgress()) {
            return [];
        }

        if (
            this.gameStateManager.isPlayerAllIn(heroPlayerUUID) ||
            !this.gameStateManager.isPlayerInHand(heroPlayerUUID)
        ) {
            return [this.disableButton(FOLD_BUTTON), this.disableButton(CHECK_BUTTON), this.disableButton(BET_BUTTON)];
        }

        const buttons = [] as BettingRoundActionButton[];
        // player can always queue a bet or fold action but we decide if it is check or call
        buttons.push(FOLD_BUTTON);
        buttons.push(this.gameStateManager.isPlayerFacingBet(heroPlayerUUID) ? CALL_BUTTON : CHECK_BUTTON);
        buttons.push(BET_BUTTON);
        return buttons;
    }

    getMinimumBetSize(heroPlayerUUID: string) {
        return this.gameStateManager.getMinimumBetSizeForPlayer(heroPlayerUUID);
    }

    getValidMenuButtons(clientUUID: string): MenuButton[] {
        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);

        const menuButtons = [SETTINGS_BUTTON, VOLUME_BUTTON, LEDGER_BUTTON]; // currently these are always visible

        if (this.gameStateManager.isPlayerAdmin(clientUUID)) {
            menuButtons.push(ADMIN_BUTTON);
            if (
                (heroPlayer && this.gameStateManager.canPlayerStartGame(heroPlayer?.uuid)) ||
                this.gameStateManager.gameWillStopAfterHand()
            ) {
                menuButtons.push(START_GAME_BUTTON);
            } else if (this.gameStateManager.shouldDealNextHand()) {
                menuButtons.push(STOP_GAME_BUTTON);
            }
        }

        // TODO leave table button
        return menuButtons;
    }

    transformAudioForPlayer(playerUUID: string): SoundByte {
        const audioQueue = this.audioService.getAudioQueue();
        return audioQueue.personal[playerUUID] || audioQueue.global;
    }

    transformChatMessage(): UiChatMessage {
        const chatMessage = this.chatService.getMessage();
        if (!chatMessage) {
            return undefined;
        }
        const uiChatMessage = {
            content: chatMessage.content,
            senderName: chatMessage.senderName,
            playerUUID: chatMessage.playerUUID,
            timestamp: Date.now(),
            seatNumber: chatMessage.seatNumber,
        };
        return uiChatMessage;
    }

    transformPlayerCards(player: Player, heroPlayerUUID: string): CardInformation {
        const isHero = heroPlayerUUID === player.uuid;
        const shouldCardsBeVisible = isHero || !player.cardsAreHidden;
        const shouldHighlightWinningCards = !this.gameStateManager.hasEveryoneButOnePlayerFolded();
        const isWinner = player.winner;

        const cards: UiCard[] = player.holeCards.map((holeCard) => {
            return shouldCardsBeVisible
                ? {
                      ...holeCard,
                      partOfWinningHand:
                          isWinner &&
                          shouldHighlightWinningCards &&
                          this.gameStateManager.isCardInPlayersBestHand(player.uuid, holeCard),
                  }
                : { hidden: true };
        });

        return {
            hand: { cards },
            handLabel: shouldCardsBeVisible && player.holeCards.length > 0 ? player.handDescription : undefined,
        };
    }

    transformCommunityCards(): UiCard[] {
        const board = this.gameStateManager.getBoard();
        const winners = this.gameStateManager.getWinners();
        const shouldHighlightWinningCards = !this.gameStateManager.hasEveryoneButOnePlayerFolded();

        if (winners.length && shouldHighlightWinningCards) {
            const winnerUUID = winners[0];
            return board.map((card) => ({
                ...card,
                partOfWinningHand: this.gameStateManager.isCardInPlayersBestHand(winnerUUID, card),
            }));
        } else {
            return [...board];
        }
    }

    transformPlayer(player: Player, heroPlayerUUID: string): UiPlayer {
        const herosTurnToAct =
            this.gameStateManager.getCurrentPlayerToAct() === player.uuid &&
            this.gameStateManager.gameIsWaitingForBetAction();
        const uiPlayer = {
            stack: player.chips - player.betAmount,
            uuid: player.uuid,
            ...this.transformPlayerCards(player, heroPlayerUUID),
            playerTimer: herosTurnToAct
                ? {
                      timeElapsed: this.gameStateManager.getCurrentPlayerTurnElapsedTime() / 1000,

                      // subtract one second such that the server timer ends just a little bit after
                      // the visual component of the UI indicates that the turn is over, to compensate
                      // and prevent from the vice-versa scenario (which would be way worse)
                      timeLimit: this.gameStateManager.getTotalPlayerTimeToAct(heroPlayerUUID) / 1000 - 1,
                  }
                : undefined,
            name: player.name,
            toAct: herosTurnToAct,
            hero: player.uuid === heroPlayerUUID,
            position: player.seatNumber,
            bet: player.betAmount,
            button: this.gameStateManager.getDealerUUID() === player.uuid,
            winner: player.winner,
            folded: this.gameStateManager.hasPlayerFolded(player.uuid),
            sittingOut: player.sittingOut && !this.gameStateManager.isPlayerInHand(player.uuid),
        };
        return uiPlayer;
    }

    getUIState(clientUUID: string, sendAll: boolean): UiState {
        // TODO document the usage of updatedKeys and consider a refactor/redesign if too complex
        const uiState = this.transformGameStateToUIState(clientUUID, sendAll);
        return uiState;
    }

    createPotSizeButtons(fullPot: number, curBet: number, curCall: number, minBet: number): SizingButton[] {
        const buttons: SizingButton[] = [];
        COMMON_POT_SIZINGS.forEach(([numerator, denominator]) => {
            const fraction = numerator / denominator;
            const betAmt = (fullPot + curBet - curCall) * fraction + curBet;
            buttons.push({
                label: numerator === denominator ? 'POT' : `${numerator}/${denominator}`,
                value: Math.ceil(betAmt),
            });
        });
        return buttons;
    }

    createBBSizeButtons(bbValue: number, minBet: number): SizingButton[] {
        const buttons: SizingButton[] = [];
        COMMON_BB_SIZINGS.forEach((numBlinds) => {
            if (numBlinds * bbValue >= minBet) {
                buttons.push({
                    label: `${numBlinds} BB`,
                    value: numBlinds * bbValue,
                });
            }
        });
        return buttons;
    }
    createMinBetButton(minBetAmt: number): SizingButton {
        return {
            label: `Min`,
            value: minBetAmt,
        };
    }

    createAllInButton(allInAmt: number): SizingButton {
        return {
            label: `All In`,
            value: allInAmt,
        };
    }
}
