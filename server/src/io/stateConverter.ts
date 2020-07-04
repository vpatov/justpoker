import { Service } from 'typedi';
import { Player } from '../../../ui/src/shared/models/player/player';
import { ServerStateKey } from '../../../ui/src/shared/models/system/server';
import { GameStage } from '../../../ui/src/shared/models/game/stateGraph';
import { BettingRoundStage, BettingRoundActionType } from '../../../ui/src/shared/models/game/betting';

import {
    UiState,
    UiPlayer,
    FOLD_BUTTON,
    CHECK_BUTTON,
    CHECK_FOLD_BUTTON,
    CALL_BUTTON,
    BET_BUTTON,
    START_GAME_BUTTON,
    STOP_GAME_BUTTON,
    GAME_SETTINGS_BUTTON,
    USER_SETTINGS_BUTTON,
    VOLUME_BUTTON,
    UiChatMessage,
    BettingActionButton,
    UiCard,
    MenuButton,
    LEDGER_BUTTON,
    PositionIndicator,
    ShowCardButton,
    LEAVE_TABLE_BUTTON,
    QUIT_GAME_BUTTON,
    BUY_CHIPS_BUTTON,
    BettingActionButtons,
} from '../../../ui/src/shared/models/ui/uiState';
import { GameType } from '../../../ui/src/shared/models/game/game';
import { GameStateManager } from '../state/gameStateManager';
import { AudioService } from '../state/audioService';

import {
    Global,
    Controller,
    getCleanController,
    SizingButton,
    COMMON_BB_SIZINGS,
    COMMON_POT_SIZINGS,
} from '../../../ui/src/shared/models/ui/uiState';
import { SoundByte } from '../../../ui/src/shared/models/state/audioQueue';
import { AnimationService } from '../state/animationService';
import { ChatService } from '../state/chatService';
import { GameInstanceLogService } from '../stats/gameInstanceLogService';

import { ClientUUID, PlayerUUID, makeBlankUUID } from '../../../ui/src/shared/models/system/uuid';
import { getHoleCardNickname } from '../../../ui/src/shared/models/game/cards';
import { PlayerPosition } from '../../../ui/src/shared/models/player/playerPosition';

declare interface CardInformation {
    hand: {
        cards: UiCard[];
    };
    handLabel: string;
}

// TODO idea for refactoring StateConverter: create new directory called "stateConverter". Every source file is responsible for different
// update key of the UiState (game, chat, audio, etc)
// the main stateConverter will aggregate the conversions from each of the other files, depending on updated keys.
// all actual conversion logic will be inside of those other files.
// The game conversion part is still the most complex, but we should be able to reduce the size of this file by about half this way.

@Service()
export class StateConverter {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly chatService: ChatService,
        private readonly gameInstanceLogService: GameInstanceLogService,
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

    animationUpdated(): boolean {
        return this.gameStateManager.getUpdatedKeys().has(ServerStateKey.ANIMATION);
    }

    sendAll(): boolean {
        return this.gameStateManager.getUpdatedKeys().has(ServerStateKey.SEND_ALL);
    }

    // Hero refers to the player who is receiving this particular UiState.
    transformGameStateToUIState(clientUUID: ClientUUID, forceSendAll: boolean): UiState {
        // TODO the way that heroPlayer / clientPlayerIsInGame is handled is a little complicated
        // and should be refactored
        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const clientPlayerIsAtTable = heroPlayer?.isAtTable;
        const heroPlayerUUID = heroPlayer ? heroPlayer.uuid : makeBlankUUID();
        const handLogEntry = this.gameInstanceLogService.getMostRecentHandLogEntry(heroPlayerUUID);
        const sendAll = forceSendAll || this.sendAll();

        // TODO put each key into its own function
        const uiState: UiState = {
            game:
                this.gameUpdated() || sendAll
                    ? {
                          global: this.getUIGlobal(clientUUID),
                          controller: clientPlayerIsAtTable
                              ? this.getUIController(clientUUID, heroPlayerUUID)
                              : getCleanController(),
                          table: {
                              spots: 9, // TODO configure
                              activePot:
                                  this.gameStateManager.getGameStage() === GameStage.SHOW_WINNER
                                      ? 0
                                      : this.gameStateManager.getActivePotValue(),
                              awardPots: this.gameStateManager.getAwardPots(),
                              fullPot: this.gameStateManager.getFullPotValue(),
                              inactivePots:
                                  this.gameStateManager.getGameStage() === GameStage.SHOW_WINNER
                                      ? []
                                      : this.gameStateManager.getInactivePotsValues(),
                              communityCards: this.transformCommunityCards(),
                              winningHandDescription: this.gameStateManager.getWinningHandDescription(),
                          },
                          players: Object.entries(this.gameStateManager.getPlayers()).map(([uuid, player]) =>
                              this.transformPlayer(player, heroPlayerUUID),
                          ),
                          menu: this.getValidMenuButtons(clientUUID),
                          gameParameters: this.gameStateManager.getGameParameters(),
                          ratHole: [], // to be implemented
                      }
                    : undefined,
            audio: this.audioUpdated() || sendAll ? this.transformAudioForPlayer(heroPlayerUUID) : undefined,
            animation: this.animationUpdated() || sendAll ? this.animationService.getAnimationState() : undefined,
            // TODO refactor to send entire chatlog on init.
            chat: this.chatUpdated() || sendAll ? this.transformChatMessage() : undefined,
            handLogEntries: sendAll
                ? this.gameInstanceLogService.serializeAllHandLogEntries(heroPlayerUUID)
                : this.gameUpdated() && handLogEntry
                ? [handLogEntry]
                : [],
        };
        return uiState;
    }

    getUIGlobal(clientUUID: ClientUUID): Global {
        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const gameStage = this.gameStateManager.getGameStage();

        const global: Global = {
            isGameInProgress: this.gameStateManager.isGameInProgress(),
            heroIsAdmin: this.gameStateManager.isClientAdmin(clientUUID),
            canStartGame: heroPlayer ? this.gameStateManager.canPlayerStartGame(heroPlayer?.uuid) : false,
            gameWillStopAfterHand: this.gameStateManager.gameWillStopAfterHand(),
            unqueueAllBettingRoundActions:
                gameStage === GameStage.INITIALIZE_NEW_HAND || gameStage === GameStage.FINISH_BETTING_ROUND,
            areOpenSeats: this.gameStateManager.areOpenSeats(),
            gameParametersWillChangeAfterHand: this.gameStateManager.gameParametersWillChangeAfterHand(),
            computedMaxBuyin: this.gameStateManager.getMaxBuyin(),
            isGameInHandInitStage: this.gameStateManager.isGameInHandInitStage(),
            isHeroAtTable: heroPlayer?.isAtTable,
            isSpectator: !heroPlayer,
            numberOfSpectators: 0, // to be implemented
            adminNames: this.gameStateManager
                .getAdminClientUUIDs()
                .map((clientUUID) => this.gameStateManager.getPlayerByClientUUID(clientUUID)?.name || 'Anonymous'),
            heroTotalChips: heroPlayer?.chips,
            willAddChips: heroPlayer?.willAddChips,
            isHeroInHand: heroPlayer?.uuid ? this.gameStateManager.isPlayerInHand(heroPlayer.uuid) : false,
            canShowHideCards: heroPlayer?.uuid ? this.gameStateManager.canPlayerShowCards(heroPlayer?.uuid) : false,
        };

        return global;
    }

    // TODO determine preconditions for when this is called. Is this function called for every player,
    // and returns an unpopulated controller for when its not the players turn? Or is this function
    // only called for the current player to act? Whatever the choice is, the usage/parameters have
    // to be made consistent with the decision, because there is some redundancy right now.
    getUIController(clientUUID: ClientUUID, heroPlayerUUID: PlayerUUID): Controller {
        const hero = this.gameStateManager.getPlayer(heroPlayerUUID);

        const bettingRoundStage = this.gameStateManager.getBettingRoundStage();
        const bbValue = this.gameStateManager.getBB();
        const fullPot = this.gameStateManager.getFullPotValue();
        const curBet = this.gameStateManager.getPreviousRaise();
        const curCall = hero.betAmount;
        const toAct =
            this.gameStateManager.getCurrentPlayerSeatToAct()?.playerUUID === heroPlayerUUID &&
            this.gameStateManager.gameIsWaitingForBetAction();
        const minBet = this.getMinimumBetSize(heroPlayerUUID);
        const maxBet = this.getMaxBetSizeForPlayer(heroPlayerUUID);

        const getSizingButtons = () => {
            if (!this.gameStateManager.isGameInProgress()) {
                return [];
            }

            const minBetButton = this.createMinBetButton(minBet);
            const allInButton = this.createAllInButton(maxBet);
            const gameType = this.gameStateManager.getGameType();
            const bbButtons = this.createBBSizeButtons(bbValue, minBet);
            const potFractionButtons = this.createPotSizeButtons(fullPot, curBet, curCall, minBet, COMMON_POT_SIZINGS);
            const potButton = this.createPotSizeButtons(fullPot, curBet, curCall, minBet, [[1, 1]]);

            switch (gameType) {
                case GameType.NLHOLDEM:
                    if (
                        bettingRoundStage === BettingRoundStage.PREFLOP ||
                        bettingRoundStage === BettingRoundStage.WAITING
                    ) {
                        return [minBetButton, ...bbButtons, allInButton];
                    } else {
                        return [minBetButton, ...potFractionButtons, ...potButton, allInButton];
                    }
                    break;
                case GameType.PLOMAHA:
                    return [minBetButton, ...potFractionButtons, ...potButton];
                default:
                    return [];
            }
        };

        const controller: Controller = {
            toAct,
            lastBettingRoundAction: this.gameStateManager.getLastBettingRoundAction(),
            min: minBet,
            max: maxBet,
            sizingButtons: getSizingButtons(),
            bettingActionButtons: this.getValidBettingRoundActions(clientUUID, heroPlayerUUID, toAct),
            dealInNextHand: !hero.sittingOut,
            willStraddle: hero.willStraddle,
            timeBanks: hero.timeBanksLeft,
            playerPositionString: this.gameStateManager.getPlayerPositionString(heroPlayerUUID),
            showWarningOnFold:
                !this.gameStateManager.isPlayerFacingBet(heroPlayerUUID) ||
                this.gameStateManager.getAllCommitedBets() === 0,
            amountToCall: this.gameStateManager.computeCallAmount(heroPlayerUUID) - curCall,
        };

        return controller;
    }

    getMaxBetSizeForPlayer(playerUUID: PlayerUUID) {
        return this.gameStateManager.getGameType() === GameType.PLOMAHA
            ? Math.min(
                  this.gameStateManager.getPotSizedBetForPlayer(playerUUID),
                  this.gameStateManager.getPlayer(playerUUID).chips,
              )
            : this.gameStateManager.getPlayer(playerUUID).chips;
    }

    disableButton(button: BettingActionButton) {
        return { ...button, disabled: true };
    }

    getValidBettingRoundActions(
        clientUUID: ClientUUID,
        heroPlayerUUID: PlayerUUID,
        toAct: boolean,
    ): BettingActionButtons {
        if (!this.gameStateManager.isGameInProgress()) {
            return {};
        }

        if (
            this.gameStateManager.isPlayerAllIn(heroPlayerUUID) ||
            this.gameStateManager.isAllInRunOut() ||
            !this.gameStateManager.isPlayerInHand(heroPlayerUUID) ||
            this.gameStateManager.isGameStageInBetweenHands()
        ) {
            return {
                [BettingRoundActionType.FOLD]: this.disableButton(FOLD_BUTTON),
                [BettingRoundActionType.CHECK]: this.disableButton(CHECK_BUTTON),
                [BettingRoundActionType.BET]: this.disableButton(BET_BUTTON),
            };
        }

        const buttons: BettingActionButtons = {};
        // player can always queue a bet or fold action but we decide if it is check or call
        buttons[BettingRoundActionType.FOLD] = FOLD_BUTTON;

        if (
            this.gameStateManager.isPlayerFacingBet(heroPlayerUUID) &&
            !this.gameStateManager.isGameStageInBetweenHands()
        ) {
            buttons[BettingRoundActionType.CALL] = CALL_BUTTON;
        } else {
            if (!toAct) {
                buttons[BettingRoundActionType.CHECK_FOLD] = CHECK_FOLD_BUTTON;
            } else {
                buttons[BettingRoundActionType.CHECK] = CHECK_BUTTON;
            }
        }

        const callAmount = this.gameStateManager.computeCallAmount(heroPlayerUUID);
        const heroPlayerStack = this.gameStateManager.getPlayerByClientUUID(clientUUID).chips;

        if (heroPlayerStack <= callAmount) {
            buttons[BettingRoundActionType.BET] = this.disableButton(BET_BUTTON);
        } else {
            buttons[BettingRoundActionType.BET] = BET_BUTTON;
        }
        return buttons;
    }

    getMinimumBetSize(heroPlayerUUID: PlayerUUID) {
        return this.gameStateManager.getMinimumBetSizeForPlayer(heroPlayerUUID);
    }

    getValidMenuButtons(clientUUID: ClientUUID): MenuButton[] {
        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);

        const menuButtons = [USER_SETTINGS_BUTTON, GAME_SETTINGS_BUTTON, VOLUME_BUTTON]; // currently these are always visible

        if (this.gameStateManager.isClientAdmin(clientUUID)) {
            if (
                (heroPlayer && this.gameStateManager.canPlayerStartGame(heroPlayer?.uuid)) ||
                this.gameStateManager.gameWillStopAfterHand()
            ) {
                menuButtons.push(START_GAME_BUTTON);
            } else if (this.gameStateManager.shouldDealNextHand()) {
                menuButtons.push(STOP_GAME_BUTTON);
            }
        }

        // only if hero is player, not for spectator
        if (heroPlayer) {
            menuButtons.push(LEDGER_BUTTON);

            // dont allow player to queue multiple buys
            if (!heroPlayer.willAddChips) {
                menuButtons.push(BUY_CHIPS_BUTTON);
            }

            // TODO how to communicate to people that this is how they "stand up"
            if (!heroPlayer.leaving && !heroPlayer.quitting && heroPlayer.isAtTable) {
                menuButtons.push(LEAVE_TABLE_BUTTON);
            }

            if (!heroPlayer.quitting) {
                menuButtons.push(QUIT_GAME_BUTTON);
            }
        }

        return menuButtons;
    }

    transformAudioForPlayer(playerUUID: PlayerUUID): SoundByte {
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

    transformPlayerCards(player: Player, heroPlayerUUID: PlayerUUID): CardInformation {
        const isHero = heroPlayerUUID === player.uuid;
        const shouldHighlightWinningCards = !this.gameStateManager.hasEveryoneButOnePlayerFolded();
        const isWinner = player.winner;

        const cards: UiCard[] = player.holeCards.map((holeCard) => {
            return holeCard.visible || isHero
                ? {
                      ...holeCard,
                      isBeingShown: holeCard.visible,
                      partOfWinningHand:
                          isWinner &&
                          shouldHighlightWinningCards &&
                          this.gameStateManager.isCardInPlayerBestHand(player.uuid, holeCard),
                  }
                : { hidden: true };
        });

        return {
            hand: { cards },
            handLabel: this.computeHandLabel(isHero, player),
        };
    }

    computeHandLabel(isHero: boolean, player: Player) {
        if (isHero && player.holeCards.length > 0 && player.bestHand) {
            const shouldAttemptConvertToNickName =
                player.holeCards.length === 2 &&
                this.gameStateManager.getBettingRoundStage() === BettingRoundStage.PREFLOP;
            return shouldAttemptConvertToNickName
                ? getHoleCardNickname(player.holeCards[0], player.holeCards[1]) || player.bestHand.descr
                : player.bestHand.descr;
        }
        return undefined;
    }

    transformCommunityCards(): UiCard[] {
        const board = this.gameStateManager.getBoard();
        const winners = this.gameStateManager.getWinners();
        const shouldHighlightWinningCards = !this.gameStateManager.hasEveryoneButOnePlayerFolded();

        if (winners.length && shouldHighlightWinningCards) {
            const winnerUUID = winners[0];
            return board.map((card) => ({
                ...card,
                partOfWinningHand: this.gameStateManager.isCardInPlayerBestHand(winnerUUID, card),
            }));
        } else {
            return [...board];
        }
    }

    transformPlayer(player: Player, heroPlayerUUID: PlayerUUID): UiPlayer {
        const herosTurnToAct =
            this.gameStateManager.getCurrentPlayerSeatToAct()?.playerUUID === player.uuid &&
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
                      timeLimit: this.gameStateManager.getTotalPlayerTimeToAct() / 1000 - 1,
                  }
                : undefined,
            name: player.name,
            quitting: player.quitting,
            leaving: player.leaving,
            toAct: herosTurnToAct,
            hero: player.uuid === heroPlayerUUID,
            position: player.seatNumber,
            bet: player.betAmount,
            avatarKey: player.avatarKey,
            positionIndicator: this.getPlayerPositionIndicator(player.uuid),
            winner: player.winner,
            disconnected: player.disconnected,
            folded: this.gameStateManager.hasPlayerFolded(player.uuid),
            sittingOut: player.sittingOut && !this.gameStateManager.isPlayerInHand(player.uuid),
            admin: this.gameStateManager.isPlayerAdmin(player.uuid),
            lastAction: this.getLastActionString(player.lastActionType),
            cannotHideCards: player.cannotHideCards,
        };
        return uiPlayer;
    }

    getLastActionString(bettingRoundActionType: BettingRoundActionType): string | undefined {
        switch (bettingRoundActionType) {
            case BettingRoundActionType.BET:
                return 'Bet';
            case BettingRoundActionType.CHECK:
                return 'Check';
            case BettingRoundActionType.CALL:
                return 'Call';
            case BettingRoundActionType.FOLD:
                return 'Fold';
            case BettingRoundActionType.ALL_IN:
                return 'All In';
            default:
                return undefined;
        }
    }
    getPlayerPositionIndicator(playerUUID: PlayerUUID): PositionIndicator | undefined {
        if (!this.gameStateManager.isGameInProgress()) {
            return undefined;
        }
        const position = this.gameStateManager.getPlayerPositionMap().get(playerUUID);

        switch (position) {
            case PlayerPosition.DEALER:
                return PositionIndicator.BUTTON;
            case PlayerPosition.SB:
                return PositionIndicator.SMALL_BLIND;
            case PlayerPosition.BB:
                return PositionIndicator.BIG_BLIND;
            default:
                break;
        }
        return undefined;
    }

    getUIState(clientUUID: ClientUUID, sendAll: boolean): UiState {
        // TODO document the usage of updatedKeys and consider a refactor/redesign if too complex
        const uiState = this.transformGameStateToUIState(clientUUID, sendAll);
        return uiState;
    }

    createPotSizeButtons(
        fullPot: number,
        curBet: number,
        curCall: number,
        minBet: number,
        sizings: [number, number][],
    ): SizingButton[] {
        const buttons: SizingButton[] = [];
        sizings.forEach(([numerator, denominator]) => {
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
