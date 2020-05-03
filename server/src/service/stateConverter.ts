import { Service } from 'typedi';
import { Card } from '../../../ui/src/shared/models/cards';
import { Player } from '../../../ui/src/shared/models/player';
import { GameState, ServerStateKey } from '../../../ui/src/shared/models/gameState';
import { strict as assert } from 'assert';

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
    UiChatMessage,
    BettingRoundActionButton,
} from '../../../ui/src/shared/models/uiState';
import { BettingRoundStage } from '../../../ui/src/shared/models/game';
import { GameStateManager } from './gameStateManager';
import { AudioService } from './audioService';

import { printObj } from '../../../ui/src/shared/util/util';

import {
    Global,
    Controller,
    cleanController,
    ActionButton,
    SizingButton,
    COMMON_BB_SIZINGS,
    COMMON_POT_SIZINGS,
} from '../../../ui/src/shared/models/uiState';
import { ValidationService, hasError } from './validationService';
import { AudioQueue } from '../../../ui/src/shared/models/audioQueue';
import { MessageService } from './messageService';
import { ChatService } from './chatService';
import { ChatMessage } from '../../../ui/src/shared/models/chat';

@Service()
export class StateConverter {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly validationService: ValidationService,
        private readonly audioService: AudioService,
        private readonly messageService: MessageService,
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
    transformGameStateToUIState(clientUUID: string): UiState {
        // TODO the way that heroPlayer / clientPlayerIsInGame is handled is a little complicated
        // and should be refactored
        console.log('in stateConverter, updatedKeys:', this.gameStateManager.getUpdatedKeys());
        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const clientPlayerIsSeated = heroPlayer?.sitting;
        const heroPlayerUUID = heroPlayer ? heroPlayer.uuid : '';
        const board = this.gameStateManager.getBoard();

        // TODO put each key into its own function
        const uiState: UiState = {
            game: this.gameUpdated()
                ? {
                      global: this.getUIGobal(clientUUID),
                      controller: clientPlayerIsSeated
                          ? this.getUIController(clientUUID, heroPlayerUUID)
                          : cleanController,
                      table: {
                          spots: 9, // TODO configure
                          pot: this.gameStateManager.getTotalPot(),
                          fullPot: this.gameStateManager.getFullPot(),
                          communityCards: [...board],
                      },
                      players: Object.entries(this.gameStateManager.getPlayers()).map(([uuid, player]) =>
                          this.transformPlayer(player, heroPlayerUUID),
                      ),
                  }
                : undefined,
            audio: clientPlayerIsSeated
                ? this.transformAudioForClient(heroPlayerUUID)
                : this.audioService.getAudioQueue(),
            // TODO refactor to send entire chatlog on init.
            chat: this.chatUpdated()
                ? this.chatService.getMessage()
                    ? this.transformChatMessage(this.chatService.getMessage())
                    : undefined
                : undefined,
        };
        return uiState;
    }

    getUIGobal(clientUUID: string): Global {
        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const clientPlayerIsSeated = heroPlayer?.sitting;

        const global: Global = {
            gameStarted: this.gameStateManager.isGameStarted(),
            heroIsSeated: clientPlayerIsSeated,
            bigBlind: this.gameStateManager.getBB(),
            smallBlind: this.gameStateManager.getSB(),
            allowStraddle: this.gameStateManager.getAllowStraddle(),
            gameType: this.gameStateManager.getGameType(),
        };

        return global;
    }

    // TODO determine preconditions for when this is called. Is this function called for every player,
    // and returns an unpopulated controller for when its not the players turn? Or is this function
    // only called for the current player to act? Whatever the choice is, the usage/parameters have
    // to be made consistent with the decision, because there is some redundancy right now.
    getUIController(clientUUID: string, heroPlayerUUID: string): Controller {
        const bettingRoundStage = this.gameStateManager.getBettingRoundStage();
        const bbValue = this.gameStateManager.getBB();
        const potSize = this.gameStateManager.getTotalPot();
        const toAct = this.gameStateManager.getCurrentPlayerToAct() === heroPlayerUUID;
        const controller: Controller = {
            toAct,
            unsetQueuedAction: this.gameStateManager.getUnsetQueuedAction(),
            min: this.getMinimumBetSize(heroPlayerUUID),
            max: this.gameStateManager.getPlayer(heroPlayerUUID).chips,
            sizingButtons: !this.gameStateManager.isGameStarted()
                ? []
                : bettingRoundStage === BettingRoundStage.PREFLOP || bettingRoundStage === BettingRoundStage.WAITING
                ? COMMON_BB_SIZINGS.map((numBlinds) => this.createBBSizeButton(numBlinds, bbValue))
                : COMMON_POT_SIZINGS.map(([numerator, denominator]) =>
                      this.createPotSizeButton(numerator, denominator, potSize),
                  ),
            bettingRoundActionButtons: this.getValidBettingRoundActions(clientUUID, heroPlayerUUID),
            adminButtons: this.getValidAdminButtons(clientUUID),
        };

        return controller;
    }

    getValidBettingRoundActions(clientUUID: string, heroPlayerUUID: string): BettingRoundActionButton[] {
        const buttons = [] as BettingRoundActionButton[];
        const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const clientPlayerIsSeated = heroPlayer?.sitting;
        if (!clientPlayerIsSeated || !this.gameStateManager.isGameStarted()) {
            return [];
        }

        const disableButton = (b: BettingRoundActionButton) => Object.assign({}, b, { disabled: true });

        if (
            !this.gameStateManager.isPlayerInHand(heroPlayerUUID) ||
            this.gameStateManager.isPlayerAllIn(heroPlayerUUID)
        ) {
            return [disableButton(FOLD_BUTTON), disableButton(CHECK_BUTTON), disableButton(BET_BUTTON)];
        }

        // player can always queue a bet or fold action but we decide if it is check or call
        buttons.push(FOLD_BUTTON);
        if (this.gameStateManager.isPlayerFacingBet(heroPlayerUUID)) {
            buttons.push(CALL_BUTTON);
        } else {
            buttons.push(CHECK_BUTTON);
        }
        buttons.push(BET_BUTTON);

        return buttons;
    }

    getMinimumBetSize(heroPlayerUUID: string) {
        return this.gameStateManager.getMinimumBetSizeForPlayer(heroPlayerUUID);
    }

    getValidAdminButtons(clientUUID: string): ActionButton[] {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        // TODO if (client.admin)

        const adminButtons = [];
        adminButtons.push(this.gameStateManager.shouldDealNextHand() ? STOP_GAME_BUTTON : START_GAME_BUTTON);
        return adminButtons;
    }

    transformChatMessage(chatMessage: ChatMessage): UiChatMessage {
        const uiChatMessage = {
            content: chatMessage.content,
            senderName: chatMessage.senderName,
            playerUUID: chatMessage.playerUUID,
            timestamp: Date.now(),
        };
        return uiChatMessage;
    }

    transformAudioForClient(playerUUID: string): AudioQueue {
        if (this.audioService.hasSFX()) {
            return this.audioService.getAudioQueue();
        }
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
        if (
            this.gameStateManager.getCurrentPlayerToAct() === playerUUID &&
            this.gameStateManager.canCurrentPlayerAct()
        ) {
            return this.audioService.getHeroTurnToActSFX();
        } else {
            return this.audioService.getAudioQueue();
        }
        // TODO create pause between cards being dealt and the first to act of that street
        // simplest way to do that, is in this method, have the start of hand sound take
        // precedence over the turn to act sound.

        // return this.audioService.getAudioQueue();
    }

    transformPlayer(player: Player, heroPlayerUUID: string): UIPlayer {
        const board = this.gameStateManager.getBoard();

        const isHero = heroPlayerUUID === player.uuid;
        const shouldCardsBeVisible = isHero || !player.cardsAreHidden;
        const toAct =
            this.gameStateManager.getCurrentPlayerToAct() === player.uuid &&
            this.gameStateManager.canCurrentPlayerAct();
        const newPlayer = {
            stack: player.chips - player.betAmount,
            uuid: player.uuid,
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
        // TODO document the usage of updatedKeys and consider a refactor/redesign if too complex
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
