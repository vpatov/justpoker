import { Service } from 'typedi';
import { GameStateManager } from './gameStateManager';
import { BettingRoundActionType, BettingRoundAction } from '../../../ui/src/shared/models/game';
import {
    SitDownRequest,
    JoinTableRequest,
    ClientWsMessageRequest,
    ClientChatMessage,
} from '../../../ui/src/shared/models/wsaction';
import { printObj } from '../../../ui/src/shared/util/util';
import {
    ValidationResponse,
    ErrorType,
    NO_ERROR,
    INTERNAL_SERVER_ERROR,
} from '../../../ui/src/shared/models/validation';

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

export function hasError(response: ValidationResponse): boolean {
    return response.errorType !== ErrorType.NO_ERROR;
}

@Service()
export class ValidationService {
    constructor(private readonly gsm: GameStateManager) {}

    ensureClientExists(clientUUID: string): ValidationResponse {
        const client = this.gsm.getConnectedClient(clientUUID);
        if (!client) {
            return {
                errorType: ErrorType.CLIENT_DOES_NOT_EXIST,
                errorString: `Client ${clientUUID} does not exist.`,
            };
        }
        return NO_ERROR;
    }

    ensureClientIsInGame(clientUUID: string): ValidationResponse {
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
        return NO_ERROR;
    }

    ensureClientIsNotInGame(clientUUID: string): ValidationResponse {
        const client = this.gsm.getConnectedClient(clientUUID);
        if (client.playerUUID) {
            return {
                errorType: ErrorType.CLIENT_ALREADY_HAS_PLAYER,
                errorString: `Client ${clientUUID} already has player association: ${client.playerUUID}`,
            };
        }
        return NO_ERROR;
    }

    ensurePlayerIsSitting(playerUUID: string): ValidationResponse {
        const player = this.gsm.getPlayer(playerUUID);
        if (!player.sitting) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player is not sitting:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`,
            };
        }
        return NO_ERROR;
    }

    ensurePlayerIsStanding(playerUUID: string): ValidationResponse {
        const player = this.gsm.getPlayer(playerUUID);
        if (player.sitting) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player is not standing:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`,
            };
        }
        return NO_ERROR;
    }

    ensurePlayerCanActRightNow(clientUUID: string): ValidationResponse {
        let response = this.ensureClientIsInGame(clientUUID);
        if (hasError(response)) {
            return response;
        }
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        response = this.ensurePlayerIsSitting(player.uuid);
        if (hasError(response)) {
            return response;
        }
        const currentPlayerToAct = this.gsm.getCurrentPlayerToAct();
        const canCurrentPlayerAct = this.gsm.getCanCurrentPlayerAct();
        if (player.uuid !== currentPlayerToAct || !canCurrentPlayerAct) {
            return {
                errorType: ErrorType.OUT_OF_TURN,
                errorString: `Not your turn!\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`,
            };
        }
        return NO_ERROR;
    }

    validateJoinTableRequest(clientUUID: string, request: JoinTableRequest): ValidationResponse {
        // TODO return this logic later
        // const response = this.ensureClientIsNotInGame(clientUUID);
        // if (hasError(response)) {
        //     return response;
        // }
        if (request.name.length > MAX_NAME_LENGTH) {
            return {
                errorString: `Name ${request.name} is too long - exceeds limit of 32 characters.`,
                errorType: ErrorType.MAX_NAME_LENGTH_EXCEEDED,
            };
        }
        return NO_ERROR;
    }

    validateSitDownRequest(clientUUID: string, request: SitDownRequest): ValidationResponse {
        let response = this.ensureClientIsInGame(clientUUID);
        if (hasError(response)) {
            return response;
        }

        const seatNumber = request.seatNumber;
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot SitDown\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

        response = this.ensurePlayerIsStanding(player.uuid);
        if (hasError(response)) {
            return response;
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
        return NO_ERROR;
    }

    validateStandUpRequest(clientUUID: string): ValidationResponse {
        const response = this.ensureClientIsInGame(clientUUID);
        if (hasError(response)) {
            return response;
        }
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        return this.ensurePlayerIsSitting(player.uuid);
    }

    validateStartGameRequest(clientUUID: string): ValidationResponse {
        // TODO validate that client is admin
        if (this.gsm.shouldDealNextHand()) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Cannot StartGame: Game is already in progress.`,
            };
        }
        return NO_ERROR;
    }

    validateStopGameRequest(clientUUID: string): ValidationResponse {
        // TODO validate that client is admin
        if (!this.gsm.shouldDealNextHand()) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Cannot StopGame: Game is not in progress.`,
            };
        }
        return NO_ERROR;
    }

    validateBettingRoundAction(clientUUID: string, action: BettingRoundAction): ValidationResponse {
        const response = this.ensurePlayerCanActRightNow(clientUUID);
        if (hasError(response)) {
            return response;
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

    private validateCheckAction(clientUUID: string): ValidationResponse {
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
        if (playerBetAmt != this.gsm.getHighestBet()) {
            return {
                errorType: ErrorType.ILLEGAL_BETTING_ACTION,
                errorString: `You cannot check without calling the blinds.`,
            };
        }
        return NO_ERROR;
    }

    // You can fold anytime. In the future, would be nice to implement
    // "Are you sure you want to fold?" prompt if user tries to fold
    // without facing a bet
    private validateFoldAction(clientUUID: string): ValidationResponse {
        // TODO ensure that player has cards. If they do not have cards, they should never be able to
        // perform this action unless theres a bug.
        return NO_ERROR;
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
    private validateBetAction(clientUUID: string, action: BettingRoundAction): ValidationResponse {
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

        return NO_ERROR;

        // TODO
        // if (!playerIsFacingRaise && !playerHasntActedYet){
        //     cant bet
        // }
    }

    // Preconditions
    /*
        Player can call if they are not already all-in.
        Player can call if they havent folded
        Player can call if they are facing a bet.
    */
    private validateCallAction(clientUUID: string): ValidationResponse {
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot Call\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

        if (!this.gsm.isPlayerFacingBet(player.uuid)) {
            return {
                errorType: ErrorType.ILLEGAL_BETTING_ACTION,
                errorString: `${errorPrefix} Player is not facing a bet.`,
            };
        }

        return NO_ERROR;
    }

    validateChatMessage(uuid: string, message: ClientChatMessage): ValidationResponse {
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
        return NO_ERROR;
    }
}
