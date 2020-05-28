import { Service } from 'typedi';
import { GameStateManager } from './gameStateManager';
import { BettingRoundActionType, BettingRoundAction, GameType } from '../../../ui/src/shared/models/game';
import {
    SitDownRequest,
    JoinTableRequest,
    ClientWsMessageRequest,
    ClientChatMessage,
    BootPlayerRequest,
} from '../../../ui/src/shared/models/api';
import { printObj } from '../../../ui/src/shared/util/util';
import { ValidationResponse, ErrorType, INTERNAL_SERVER_ERROR } from '../../../ui/src/shared/models/validation';
import { ClientUUID, PlayerUUID } from '../../../ui/src/shared/models/uuid';

const MAX_NAME_LENGTH = 32;

/*
    TODO: Redesign error message construction
    TODO: Split methods into validateAction and ensureCondition
        - validateAction methods called externally, ensureCondition methods called internally
*/

/**
 * Validation layer that ensures that all incoming action requests are valid and
 * legal. All preconditions are checked before any game state updates are
 * performed, which allows the gaurantee of atomic operations (either they
 * completely succeed, or completely fail).
 */

@Service()
export class ValidationService {
    constructor(private readonly gsm: GameStateManager) {}

    ensureClientExists(clientUUID: ClientUUID): ValidationResponse {
        const client = this.gsm.getConnectedClient(clientUUID);
        if (!client) {
            return {
                errorType: ErrorType.CLIENT_DOES_NOT_EXIST,
                errorString: `Client ${clientUUID} does not exist.`,
            };
        }
        return undefined;
    }

    ensureClientIsInGame(clientUUID: ClientUUID): ValidationResponse {
        const client = this.gsm.getConnectedClient(clientUUID);

        if (!client.playerUUID) {
            return {
                errorType: ErrorType.CLIENT_HAS_NOT_JOINED_GAME,
                errorString: `Client ${clientUUID} has not joined the game.`,
            };
        }

        const player = this.gsm.getPlayer(client.playerUUID);
        if (!player) {
            return {
                errorType: ErrorType.PLAYER_DOES_NOT_EXIST,
                errorString: `Player ${client.playerUUID} does not exist.`,
            };
        }
        return undefined;
    }

    ensureClientIsNotInGame(clientUUID: ClientUUID): ValidationResponse {
        const client = this.gsm.getConnectedClient(clientUUID);
        if (client.playerUUID) {
            return {
                errorType: ErrorType.CLIENT_ALREADY_HAS_PLAYER,
                errorString: `Client ${clientUUID} already has player association: ${client.playerUUID}`,
            };
        }
        return undefined;
    }

    ensurePlayerIsSitting(playerUUID: PlayerUUID): ValidationResponse {
        const player = this.gsm.getPlayer(playerUUID);
        if (!player.sitting) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player is not sitting:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`,
            };
        }
        return undefined;
    }

    ensurePlayerIsStanding(playerUUID: PlayerUUID): ValidationResponse {
        const player = this.gsm.getPlayer(playerUUID);
        if (player.sitting) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player is not standing:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`,
            };
        }
        return undefined;
    }

    ensurePlayerIsSittingIn(playerUUID: PlayerUUID): ValidationResponse {
        const player = this.gsm.getPlayer(playerUUID);
        if (player.sittingOut) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player is not sitting in:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`,
            };
        }
        return undefined;
    }

    ensurePlayerIsSittingOut(playerUUID: PlayerUUID): ValidationResponse {
        const player = this.gsm.getPlayer(playerUUID);
        if (!player.sittingOut) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player is not sitting out:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`,
            };
        }
        return undefined;
    }

    ensurePlayerCanActRightNow(clientUUID: ClientUUID): ValidationResponse {
        let error = this.ensureClientIsInGame(clientUUID);
        if (error) {
            return error;
        }
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        error = this.ensurePlayerIsSitting(player.uuid);
        if (error) {
            return error;
        }
        const currentPlayerToAct = this.gsm.getCurrentPlayerToAct();
        const gameIsWaitingForBetAction = this.gsm.gameIsWaitingForBetAction();
        if (player.uuid !== currentPlayerToAct || !gameIsWaitingForBetAction) {
            return {
                errorType: ErrorType.OUT_OF_TURN,
                errorString: `Not your turn!\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`,
            };
        }
        return undefined;
    }

    validateJoinTableRequest(clientUUID: ClientUUID, request: JoinTableRequest): ValidationResponse {
        // TODO return this logic later
        // const error = this.ensureClientIsNotInGame(clientUUID);
        // if (error) {
        //     return error;
        // }
        if (request.name.length > MAX_NAME_LENGTH) {
            return {
                errorString: `Name ${request.name} is too long - exceeds limit of 32 characters.`,
                errorType: ErrorType.MAX_NAME_LENGTH_EXCEEDED,
            };
        }
        return undefined;
    }

    validateSitDownRequest(clientUUID: ClientUUID, request: SitDownRequest): ValidationResponse {
        let error = this.ensureClientIsInGame(clientUUID);
        if (error) {
            return error;
        }

        const seatNumber = request.seatNumber;
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot SitDown\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

        error = this.ensurePlayerIsStanding(player.uuid);
        if (error) {
            return error;
        }

        if (player.chips <= 0) {
            return {
                errorType: ErrorType.NOT_ENOUGH_CHIPS,
                errorString: `${errorPrefix} Player needs chips to sit down.`,
            };
        }

        if (!this.gsm.isValidSeat(seatNumber)) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `${errorPrefix} Seat ${seatNumber} is not a valid seat.`,
            };
        }

        if (this.gsm.isSeatTaken(seatNumber)) {
            return {
                errorType: ErrorType.SEAT_IS_TAKEN,
                errorString: `${errorPrefix} Seat ${seatNumber} is taken. Please pick another`,
            };
        }
        return undefined;
    }

    validateStandUpRequest(clientUUID: ClientUUID): ValidationResponse {
        const error = this.ensureClientIsInGame(clientUUID);
        if (error) {
            return error;
        }
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        return this.ensurePlayerIsSitting(player.uuid);
    }

    validateSitInAction(clientUUID: ClientUUID): ValidationResponse {
        const error = this.ensureClientIsInGame(clientUUID);
        if (error) {
            return error;
        }
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        return this.ensurePlayerIsSittingOut(player.uuid);
    }

    validateSitOutAction(clientUUID: ClientUUID): ValidationResponse {
        const error = this.ensureClientIsInGame(clientUUID);
        if (error) {
            return error;
        }
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        return this.ensurePlayerIsSittingIn(player.uuid);
    }

    validateStartGameRequest(clientUUID: ClientUUID): ValidationResponse {
        // TODO validate that client is admin
        if (this.gsm.shouldDealNextHand()) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Cannot StartGame: Game is already in progress.`,
            };
        }
        return undefined;
    }

    validateStopGameRequest(clientUUID: ClientUUID): ValidationResponse {
        // TODO validate that client is admin
        if (!this.gsm.shouldDealNextHand()) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Cannot StopGame: Game is not in progress.`,
            };
        }
        return undefined;
    }

    validateBettingRoundAction(clientUUID: ClientUUID, action: BettingRoundAction): ValidationResponse {
        const error = this.ensurePlayerCanActRightNow(clientUUID);
        if (error) {
            return error;
        }
        switch (action.type) {
            case BettingRoundActionType.CHECK:
                return this.validateCheckAction(clientUUID);
            case BettingRoundActionType.FOLD:
                return this.validateFoldAction(clientUUID);
            case BettingRoundActionType.CALL:
                return this.validateCallAction(clientUUID);
            case BettingRoundActionType.BET:
                return this.validateBetAction(clientUUID, action);
            default:
                return INTERNAL_SERVER_ERROR;
        }
    }

    private validateCheckAction(clientUUID: ClientUUID): ValidationResponse {
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        const bettingRoundActions = this.gsm.getBettingRoundActionTypes();
        const playerBetAmt = player.betAmount;

        // Check to see if anyone has bet before us
        for (const actionType of bettingRoundActions) {
            if (actionType === BettingRoundActionType.BET) {
                return {
                    errorType: ErrorType.ILLEGAL_BETTING_ACTION,
                    errorString: `You cannot check when someone before you has bet.`,
                };
            }
        }

        // Blinds aren't considered a betAction, so make sure our bet matches
        // the highest bet if we are checking. This way, only the big blind and
        // those who post a blind can check.
        // TODO Figure out: There might be a scenario where this isn't true. I've noticed in Ignition,
        // that if you sit in out of position and opt to post a blind early, and then some
        // other condition is met (that im not sure of at the moment), it makes you post more than
        // the big blind. However, others do not have to call the extra amount, they can still
        // just call the blind. It functions sort of like an ante I guess.
        if (playerBetAmt != this.gsm.getHighestBet()) {
            return {
                errorType: ErrorType.ILLEGAL_BETTING_ACTION,
                errorString: `You cannot check without calling the blinds.`,
            };
        }
        return undefined;
    }

    // You can fold anytime, that you can act. In the future, would be nice to implement
    // "Are you sure you want to fold?" prompt if user tries to fold
    // without facing a bet
    private validateFoldAction(clientUUID: string): ValidationResponse {
        return undefined;
    }

    // Preconditions:
    /* 
    User can bet with X amount of chips in the pot when:
    - It is their turn to act
    - They are not calling here
    - The highest bet before them was X amount
    - The amount by which X is greater than the previous 
      bet is at least the previous raice
    - player has at least X chips
    - player hasnt folded (if a player has folded, it should never be their turn to act)
    */
    private validateBetAction(clientUUID: ClientUUID, action: BettingRoundAction): ValidationResponse {
        // TODO remove this from here and put this extra checking in a type validation layer.
        const betAmount = typeof action.amount === 'number' ? action.amount : Number(action.amount);

        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot Bet\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

        if (player.chips < betAmount) {
            return {
                errorType: ErrorType.NOT_ENOUGH_CHIPS,
                errorString: `${errorPrefix} Player cannot bet ${betAmount}, they only have ${player.chips} chips.`,
            };
        }

        if (!this.gsm.isPlayerInHand(player.uuid)) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `${errorPrefix} FATAL ERROR: Player is not in the hand, they should not be able to bet.`,
            };
        }

        const minimumBet = this.gsm.getMinimumBetSizeForPlayer(player.uuid);

        if (this.gsm.getGameType() === GameType.PLOMAHA) {
            const maximumBetSize = this.gsm.getPotSizedBetForPlayer(player.uuid);
            if (betAmount > maximumBetSize) {
                return {
                    errorType: ErrorType.ILLEGAL_BETTING_ACTION,
                    errorString:
                        `${errorPrefix} Player cannot bet ${betAmount}\nmaximum bet is ${maximumBetSize} in PLOMAHA` +
                        ` previousRaise is ${this.gsm.getPreviousRaise()}, fullPot is ${this.gsm.getFullPot()}.`,
                };
            }
        }

        if (betAmount < minimumBet) {
            return {
                errorType: ErrorType.ILLEGAL_BETTING_ACTION,
                errorString:
                    `${errorPrefix} Player cannot bet ${betAmount}\nminimum bet is ${minimumBet},` +
                    ` previousRaise is ${this.gsm.getPreviousRaise()}, minRaiseDiff is ${this.gsm.getMinRaiseDiff()}, ` +
                    `partialAllInLeftOver is ${this.gsm.getPartialAllInLeftOver()}. Player has ${
                        player.chips
                    } chips, ` +
                    `so they are ${player.chips === betAmount ? '' : 'NOT'} all in.`,
            };
        }

        return undefined;

        // TODO - Handle unique edge case:
        /*
            A: 200 chips, B: 200 chips, C: 110 chips. sb/bb: 1/2
            A places SB of 1.
            B places BB of 2.
            C is first to act, bets 50.
            A raises to 100.
            B calls 100.
            C goes all-in for 110.
            C's all in is NOT considered a raise, becaues it less than the minimum legal raise amount (150).
            Therefore, when the action comes back to A, he can only call or fold, but cannot raise.

            Instead of crafting extra conditions and special cases for CALL and BET bettingRoundActionTypes, it
            might be simpler to create a new enum member, ALL_IN_NOT_RAISE, set it appropriately for player C in
            the scenario above, and check for that type in the validateCall/Bet/Check actions.
        */
    }

    // Preconditions
    /*
        Player can call if they are not already all-in.
        Player can call if they havent folded
        Player can call if they are facing a bet.
    */
    private validateCallAction(clientUUID: ClientUUID): ValidationResponse {
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot Call\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

        if (!this.gsm.isPlayerFacingBet(player.uuid)) {
            return {
                errorType: ErrorType.ILLEGAL_BETTING_ACTION,
                errorString: `${errorPrefix} Player is not facing a bet.`,
            };
        }

        return undefined;
    }

    validateChatMessage(clientUUID: ClientUUID, message: ClientChatMessage): ValidationResponse {
        const messageLength = message.content.length;
        if (messageLength > 1000) {
            return {
                errorType: ErrorType.MAX_CHAT_MESSAGE_LENGTH_EXCEEDED,
                errorString: `Message: ${message.content.substr(
                    0,
                    50,
                )}... is ${messageLength} characters, over the allowed limit of 1000.`,
            };
        }
        return undefined;
    }

    ensureClientIsAdmin(clientUUID: ClientUUID): ValidationResponse {
        if (this.gsm.getAdminUUID() !== clientUUID) {
            return {
                errorType: ErrorType.NOT_ADMIN,
                errorString: `Only admins can perform that action.`,
            };
        }
        return undefined;
    }

    validateBootPlayerAction(clientUUID: ClientUUID, req: BootPlayerRequest): ValidationResponse {
        const error = this.ensureClientIsAdmin(clientUUID);
        if (error) {
            return error;
        }

        const bootPlayer = this.gsm.getPlayer(req.playerUUID);
        if (!bootPlayer) {
            return {
                errorType: ErrorType.PLAYER_DOES_NOT_EXIST,
                errorString: `Player ${req.playerUUID} does not exist.`,
            };
        }

        const requestingPlayer = this.gsm.getPlayerByClientUUID(clientUUID);
        if (requestingPlayer && requestingPlayer.uuid === bootPlayer.uuid) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Admin cannot boot themselves.`,
            };
        }

        return undefined;
    }

    validateUseTimeBankAction(clientUUID: ClientUUID) {
        const error = this.ensurePlayerCanActRightNow(clientUUID);
        if (error) {
            return error;
        }
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        if (this.gsm.getTimeBanksLeft(player.uuid) === 0) {
            return {
                errorType: ErrorType.NO_MORE_TIMEBANKS,
                errorString: `Player ${player.uuid} has no more time banks left.`,
            };
        }
        return undefined;
    }
}
