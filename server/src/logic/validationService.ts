import { Service } from 'typedi';
import { GameStateManager } from '../state/gameStateManager';
import { GameType, GameParameters } from '../../../ui/src/shared/models/game/game';
import { BettingRoundActionType, BettingRoundAction } from '../../../ui/src/shared/models/game/betting';

import {
    JoinTableRequest,
    ClientChatMessage,
    BootPlayerRequest,
    AddAdminRequest,
    JoinGameRequest,
    JoinGameAndTableRequest,
    SetChipsRequest,
    BuyChipsRequest,
    SeatChangeRequest,
    ChangeAvatarRequest,
} from '../../../ui/src/shared/models/api/api';

import { ValidationResponse, ErrorType, INTERNAL_SERVER_ERROR } from '../../../ui/src/shared/models/api/validation';
import { ClientUUID, PlayerUUID } from '../../../ui/src/shared/models/system/uuid';
import { Card, cardsAreEqual } from '../../../ui/src/shared/models/game/cards';
import { MIN_VALUES, MAX_VALUES } from '../../../ui/src/shared/util/consts';
import { INIT_HAND_STAGES, GameStage } from '../../../ui/src/shared/models/game/stateGraph';

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

        if (!client?.playerUUID) {
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
        if (client?.playerUUID) {
            return {
                errorType: ErrorType.CLIENT_ALREADY_HAS_PLAYER,
                errorString: `Client ${clientUUID} already has player association: ${client.playerUUID}`,
            };
        }
        return undefined;
    }

    ensurePlayerIsAtTable(playerUUID: PlayerUUID): ValidationResponse {
        const player = this.gsm.getPlayer(playerUUID);
        if (!player.isAtTable) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player is not sitting:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`,
            };
        }
        return undefined;
    }

    ensurePlayerIsNotAtTable(playerUUID: PlayerUUID): ValidationResponse {
        const player = this.gsm.getPlayer(playerUUID);
        if (player.isAtTable) {
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
        error = this.ensurePlayerIsAtTable(player.uuid);
        if (error) {
            return error;
        }
        const currentPlayerToActUUID = this.gsm.getCurrentPlayerSeatToAct()?.playerUUID;
        const gameIsWaitingForBetAction = this.gsm.gameIsWaitingForBetAction();
        if (player.uuid !== currentPlayerToActUUID || !gameIsWaitingForBetAction) {
            return {
                errorType: ErrorType.OUT_OF_TURN,
                errorString: `Not your turn!\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`,
            };
        }
        return undefined;
    }

    validateJoinGameRequest(clientUUID: ClientUUID, request: JoinGameRequest): ValidationResponse {
        const error = this.ensureClientIsNotInGame(clientUUID);
        if (error) return error;

        if (request.name.length > MAX_NAME_LENGTH) {
            return {
                errorString: `Name ${request.name} is too long - exceeds limit of ${MAX_NAME_LENGTH} characters.`,
                errorType: ErrorType.MAX_NAME_LENGTH_EXCEEDED,
            };
        }

        const [minBuyin, maxBuyin] = [this.gsm.getMinBuyin(), this.gsm.getMaxBuyin()];
        if (this.validateMinMaxValues(request.buyin, minBuyin, maxBuyin, 'buyin')) {
            return {
                errorString: `Buyin ${request.buyin} is outside of game parameter buyin limits of ${minBuyin} - ${maxBuyin}.`,
                errorType: ErrorType.ILLEGAL_ACTION,
            };
        }

        // TODO validate avatarkey to ensure that it is an existing avatar

        return undefined;
    }

    validateJoinTableRequest(clientUUID: ClientUUID, request: JoinTableRequest): ValidationResponse {
        let error = this.ensureClientIsInGame(clientUUID);
        if (error) {
            return error;
        }

        const seatNumber = request.seatNumber;
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot SitDown\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

        error = this.ensurePlayerIsNotAtTable(player.uuid);
        if (error) {
            return error;
        }

        if (player.chips <= 0) {
            return {
                errorType: ErrorType.NOT_ENOUGH_CHIPS,
                errorString: `${errorPrefix} Player needs chips to join the table.`,
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
                errorString: `${errorPrefix} Seat ${seatNumber} is taken. Please pick another.`,
            };
        }
        return undefined;
    }

    validateJoinGameAndTableRequest(clientUUID: ClientUUID, request: JoinGameAndTableRequest): ValidationResponse {
        const error = this.validateJoinGameRequest(clientUUID, request);
        if (error) return error;
        if (!this.gsm.areOpenSeats()) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `There are no empty seats at the moment, you cannot join the table.`,
            };
        }
        return undefined;
    }

    validateSeatChangeRequest(clientUUID: ClientUUID, request: SeatChangeRequest): ValidationResponse {
        const seatNumber = request.seatNumber;
        let error = this.ensureClientIsInGame(clientUUID);
        if (error) return error;

        error = this.validateNotInGameStages(INIT_HAND_STAGES, 'switch seats');
        if (error) return error;

        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        if (!this.gsm.isValidSeat(seatNumber)) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Cannot switch seats: Seat ${seatNumber} is not a valid seat.`,
            };
        }

        if (this.gsm.isSeatTaken(seatNumber)) {
            return {
                errorType: ErrorType.SEAT_IS_TAKEN,
                errorString: `Cannot switch seats: Seat ${seatNumber} is taken. Please pick another.`,
            };
        }

        if (this.gsm.isPlayerInHand(player.uuid)) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Cannot switch seats while you are playing a hand.`,
            };
        }

        return undefined;
    }

    validateSitInOrOutAction(clientUUID: ClientUUID): ValidationResponse {
        const error = this.ensureClientIsInGame(clientUUID);
        if (error) return error;

        return this.validateNotInGameStages(INIT_HAND_STAGES, 'sit in/out');
    }

    validateSitInAction(clientUUID: ClientUUID): ValidationResponse {
        let error = this.validateSitInOrOutAction(clientUUID);
        if (error) return error;

        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        error = this.ensurePlayerIsSittingOut(player.uuid);
        if (error) return error;

        if (player.chips <= 0) {
            return {
                errorString: `Player ${player.name} ${player.uuid} cannot sit in without any chips.`,
                errorType: ErrorType.NOT_ENOUGH_CHIPS,
            };
        }

        return undefined;
    }

    validateSitOutAction(clientUUID: ClientUUID): ValidationResponse {
        const error = this.validateSitInOrOutAction(clientUUID);
        if (error) return error;

        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        return this.ensurePlayerIsSittingIn(player.uuid);
    }

    validateNotInGameStages(stages: GameStage[], actionString?: string): ValidationResponse {
        const stage = this.gsm.getGameStage();
        if (stages.indexOf(stage) > -1) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Cannot perform ${actionString || 'action'} during gamestage ${stage}`,
            };
        }
        return undefined;
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

    validateShowHideCardAction(clientUUID: ClientUUID, cards: Card[]): ValidationResponse {
        const error = this.ensureClientIsInGame(clientUUID);
        if (error) {
            return error;
        }
        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        // check that they are allowed to show cards
        if (!this.gsm.canPlayerShowCards(player.uuid)) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player is not allowed to show cards.`,
            };
        }

        // check that player posseses cards they want to show
        return cards.every((showCard) => player.holeCards.find((holeCard) => cardsAreEqual(holeCard, showCard)))
            ? undefined
            : {
                  errorType: ErrorType.ILLEGAL_ACTION,
                  errorString:
                      `Player cannot show cards: ${JSON.stringify(cards)}. ` +
                      `Player cards: ${JSON.stringify(player.holeCards)}`,
              };
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
                        ` previousRaise is ${this.gsm.getPreviousRaise()}, fullPot is ${this.gsm.getFullPotValue()}.`,
                };
            }
        }

        if (betAmount < minimumBet) {
            return {
                errorType: ErrorType.ILLEGAL_BETTING_ACTION,
                errorString:
                    `${errorPrefix} Player cannot bet ${betAmount}\nminimum bet is ${minimumBet},` +
                    ` previousRaise is ${this.gsm.getPreviousRaise()}, minRaiseDiff is ${this.gsm.getMinRaiseDiff()}, ` +
                    `Player has ${player.chips} chips, ` +
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
        if (!this.gsm.isClientAdmin(clientUUID)) {
            return {
                errorType: ErrorType.NOT_ADMIN,
                errorString: `Only admins can perform that action.`,
            };
        }
        return undefined;
    }

    validateQuitGameRequest(clientUUID: ClientUUID): ValidationResponse {
        const error = this.ensureClientIsInGame(clientUUID);
        if (error) return error;

        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        if (player.quitting) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player already has quitting action queued.`,
            };
        }
        return undefined;
    }

    validateLeaveTableRequest(clientUUID: ClientUUID): ValidationResponse {
        let error = this.ensureClientIsInGame(clientUUID);
        if (error) return error;

        const player = this.gsm.getPlayerByClientUUID(clientUUID);
        error = this.ensurePlayerIsAtTable(player.uuid);
        if (error) return error;

        if (player.quitting) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player already has quitting action queued. When they quit they will leave.`,
            };
        }

        if (player.leaving) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player already has leaving action queued.`,
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

        if (bootPlayer.quitting) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player ${req.playerUUID} is already quitting.`,
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

    validateAddAdminAction(clientUUID: ClientUUID, req: AddAdminRequest): ValidationResponse {
        const error = this.ensureClientIsAdmin(clientUUID);
        if (error) {
            return error;
        }

        const newAdminPlayer = this.gsm.getPlayer(req.playerUUID);
        if (!newAdminPlayer) {
            return {
                errorType: ErrorType.PLAYER_DOES_NOT_EXIST,
                errorString: `Player ${req.playerUUID} does not exist.`,
            };
        }

        if (this.gsm.isPlayerAdmin(newAdminPlayer.uuid)) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player is already an admin.`,
            };
        }

        return undefined;
    }

    validateRemoveAdminAction(clientUUID: ClientUUID, req: AddAdminRequest): ValidationResponse {
        const error = this.ensureClientIsAdmin(clientUUID);
        if (error) {
            return error;
        }

        const rmAdminPlayer = this.gsm.getPlayer(req.playerUUID);
        if (!rmAdminPlayer) {
            return {
                errorType: ErrorType.PLAYER_DOES_NOT_EXIST,
                errorString: `Player ${req.playerUUID} does not exist.`,
            };
        }

        if (!this.gsm.isPlayerAdmin(rmAdminPlayer.uuid)) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player is not an admin.`,
            };
        }

        const requestingPlayer = this.gsm.getPlayerByClientUUID(clientUUID);
        if (requestingPlayer && requestingPlayer.uuid !== rmAdminPlayer.uuid) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Admins can only remove self as admin.`,
            };
        }

        if (this.gsm.getAdminClientUUIDs().length === 1) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `This is the last admin. Cannot remove.`,
            };
        }

        return undefined;
    }

    validateUseTimeBankAction(clientUUID: ClientUUID) {
        const { allowTimeBanks } = this.gsm.getGameParameters();
        if (!allowTimeBanks) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Time bank are not enabled in this game.`,
            };
        }
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

    validateMinMaxValues(value: number, min: number, max: number, field?: string): ValidationResponse {
        if (value > max) {
            return {
                errorType: ErrorType.ILLEGAL_VALUE,
                errorString: `Value ${value}${field ? ` for field ${field}` : ''} exceeds max value ${max}`,
            };
        }
        if (value < min) {
            return {
                errorType: ErrorType.ILLEGAL_VALUE,
                errorString: `Value ${value}${field ? ` for field ${field}` : ''} is below min value ${min}`,
            };
        }
        return undefined;
    }

    validateSetGameParameters(clientUUID: ClientUUID, gameParameters: GameParameters): ValidationResponse {
        const error = this.ensureClientIsAdmin(clientUUID);
        if (error) {
            return error;
        }
        const { bigBlind, smallBlind, maxBuyin, minBuyin, timeToAct, numberTimeBanks, timeBankTime } = gameParameters;

        if (maxBuyin < minBuyin) {
            return {
                errorType: ErrorType.ILLEGAL_VALUE,
                errorString: `maxBuyin cannot be less than minBuyin`,
            };
        }

        if (bigBlind < smallBlind) {
            return {
                errorType: ErrorType.ILLEGAL_VALUE,
                errorString: `smallBlind must be less than or equal to bigBlind`,
            };
        }

        const minMaxErrors: ValidationResponse[] = [
            this.validateMinMaxValues(smallBlind, MIN_VALUES.SMALL_BLIND, MAX_VALUES.SMALL_BLIND, 'smallBlind'),
            this.validateMinMaxValues(bigBlind, MIN_VALUES.BIG_BLIND, MAX_VALUES.BIG_BLIND, 'bigBlind'),
            this.validateMinMaxValues(maxBuyin, MIN_VALUES.BUY_IN, MAX_VALUES.BUY_IN, 'maxBuyin'),
            this.validateMinMaxValues(minBuyin, 0, MAX_VALUES.BUY_IN, 'minBuyin'),
            this.validateMinMaxValues(timeToAct, MIN_VALUES.TIME_TO_ACT, MAX_VALUES.TIME_TO_ACT, 'timeToAct'),
            this.validateMinMaxValues(
                numberTimeBanks,
                MIN_VALUES.NUMBER_TIME_BANKS,
                MAX_VALUES.NUMBER_TIME_BANKS,
                'numberTimeBanks',
            ),
            this.validateMinMaxValues(
                timeBankTime,
                MIN_VALUES.TIME_BANK_TIME,
                MAX_VALUES.TIME_BANK_TIME,
                'timeBankTime',
            ),
        ];

        return minMaxErrors.find((err) => err !== undefined);
    }

    validateSetChipsRequest(clientUUID: ClientUUID, req: SetChipsRequest) {
        let error = this.ensureClientIsAdmin(clientUUID);
        if (error) {
            return error;
        }

        const playerToModify = this.gsm.getPlayer(req.playerUUID);
        if (!playerToModify) {
            return {
                errorType: ErrorType.PLAYER_DOES_NOT_EXIST,
                errorString: `Player ${req.playerUUID} does not exist.`,
            };
        }

        error = this.validateMinMaxValues(req.chipAmount, 0, MAX_VALUES.BUY_IN, 'buyIn');
        if (error) {
            return error;
        }
        return undefined;
    }

    validateBuyChipsRequest(clientUUID: ClientUUID, req: BuyChipsRequest) {
        const player = this.gsm.getPlayer(req.playerUUID);
        if (!player) {
            return {
                errorType: ErrorType.PLAYER_DOES_NOT_EXIST,
                errorString: `Player ${req.playerUUID} does not exist.`,
            };
        }

        if (player.willAddChips) {
            return {
                errorType: ErrorType.ILLEGAL_ACTION,
                errorString: `Player ${req.playerUUID} already has buying queued for ${player.willAddChips} amount.`,
            };
        }

        const error = this.validateMinMaxValues(
            player.chips + req.chipAmount,
            MIN_VALUES.BUY_IN,
            this.gsm.getMaxBuyin(),
            'gameMaxBuyin',
        );
        if (error) {
            return error;
        }
        return undefined;
    }

    validateChangeAvatarRequest(clientUUID: ClientUUID) {
        const clientPlayer = this.gsm.getPlayerByClientUUID(clientUUID);
        if (!clientPlayer) {
            return {
                errorType: ErrorType.PLAYER_DOES_NOT_EXIST,
                errorString: `Player ${clientPlayer.uuid} does not exist.`,
            };
        }

        return undefined;
    }
}
