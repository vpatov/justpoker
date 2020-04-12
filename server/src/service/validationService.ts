import { Service } from 'typedi';
import { GameStateManager } from './gameStateManager';
import { BettingRoundActionType, BettingRoundAction } from '../../../shared/models/game';
import { SitDownRequest, JoinTableRequest } from '../../../shared/models/wsaction';
import { printObj } from '../../../shared/util/util';

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
    constructor(private readonly gameStateManager: GameStateManager) {}

    ensureClientExists(clientUUID: string) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        if (!client) {
            throw Error(`Client ${clientUUID} does not exist.`);
        }
    }

    ensureClientIsInGame(clientUUID: string) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);

        if (!client.playerUUID) {
            throw Error(`Client ${clientUUID} has not joined the game.`);
        }

        const player = this.gameStateManager.getPlayer(client.playerUUID);
        if (!player) {
            throw Error(`Player ${client.playerUUID} does not exist.`);
        }
    }

    ensureClientIsNotInGame(clientUUID: string) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        if (client.playerUUID) {
            throw Error(`Client ${clientUUID} already has player association: ${client.playerUUID}`);
        }
    }

    ensurePlayerIsSitting(playerUUID: string) {
        const player = this.gameStateManager.getPlayer(playerUUID);
        if (!player.sitting) {
            throw Error(`Player is not sitting:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`);
        }
    }

    ensurePlayerIsStanding(playerUUID: string) {
        const player = this.gameStateManager.getPlayer(playerUUID);
        if (player.sitting) {
            throw Error(`Player is not standing:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`);
        }
    }

    // TODO can probably use string templates in a more elegant way to handle errorPrefix
    ensureCorrectPlayerToAct(clientUUID: string) {
        this.ensureClientIsInGame(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.ensurePlayerIsSitting(player.uuid);
        const currentPlayerToAct = this.gameStateManager.getCurrentPlayerToAct();
        if (player.uuid !== currentPlayerToAct) {
            throw Error(`Not your turn!\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`);
        }
    }

    validateJoinTableRequest(clientUUID: string, request: JoinTableRequest) {
        this.ensureClientIsNotInGame(clientUUID);
        if (request.name.length > MAX_NAME_LENGTH) {
            throw Error(`Name ${request.name} is too long - exceeds limit of 32 characters.`);
        }
    }

    validateSitDownRequest(clientUUID: string, request: SitDownRequest) {
        this.ensureClientIsInGame(clientUUID);

        const seatNumber = request.seatNumber;
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot SitDown\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

        this.ensurePlayerIsStanding(player.uuid);

        if (player.chips <= 0) {
            throw Error(`${errorPrefix} Player needs chips to sit down.`);
        }

        if (!this.gameStateManager.isValidSeat(seatNumber)) {
            throw Error(`${errorPrefix} Seat ${seatNumber} is not a valid seat.`);
        }

        if (this.gameStateManager.isSeatTaken(seatNumber)) {
            throw Error(`${errorPrefix} Seat ${seatNumber} is taken. Please pick another`);
        }
    }

    validateStandUpRequest(clientUUID: string) {
        this.ensureClientIsInGame(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.ensurePlayerIsSitting(player.uuid);
    }

    validateStartGameRequest(clientUUID: string) {
        // TODO validate that client is admin
        if (this.gameStateManager.isGameInProgress()) {
            throw Error(`Cannot StartGame: Game is already in progress.`);
        }
    }

    validateStopGameRequest(clientUUID: string) {
        // TODO validate that client is admin
        if (!this.gameStateManager.isGameInProgress()) {
            throw Error(`Cannot StopGame: Game is not in progress.`);
        }
    }

    validateCheckAction(clientUUID: string) {
        this.ensureCorrectPlayerToAct(clientUUID);

        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const bettingRoundActions = this.gameStateManager.getBettingRoundActionTypes();
        const playerBetAmt = player.betAmount;

        // Check to see if anyone has bet before us
        for (const actionType of bettingRoundActions) {
            if (actionType === BettingRoundActionType.BET) {
                throw Error(`You cannot check when someone before you has bet.`);
            }
        }

        // Blinds aren't considered a betAction, so make sure our bet matches
        // the highest bet if we are checking. This way, only the big blind and
        // those who post a blind can check.
        if (playerBetAmt != this.gameStateManager.getHighestBet()) {
            throw Error(`You cannot check without calling the blinds.`);
        }
    }

    // You can fold anytime. In the future, would be nice to implement
    // "Are you sure you want to fold?" prompt if user tries to fold
    // without facing a bet
    validateFoldAction(clientUUID: string) {
        this.ensureCorrectPlayerToAct(clientUUID);
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
    //TODO complete
    validateBetAction(clientUUID: string, action: BettingRoundAction) {
        this.ensureCorrectPlayerToAct(clientUUID);

        const betAmount = typeof action.amount === 'number' ? action.amount : Number(action.amount);

        // if (typeof betAmount !== 'number') {
        //     throw Error(`Bet amount should be a number. Received ${typeof betAmount}`);
        // }

        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot Bet\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

        if (player.chips < betAmount) {
            throw Error(`${errorPrefix} Player cannot bet ${betAmount}, they only have ${player.chips} chips.`);
        }

        if (!this.gameStateManager.isPlayerInHand(player.uuid)) {
            throw Error(`${errorPrefix} FATAL ERROR: Player is not in the hand, they should not be able to bet.`);
        }

        const minRaiseDiff = this.gameStateManager.getMinRaiseDiff();
        const previousRaise = this.gameStateManager.getPreviousRaise();
        const partialAllInLeftOver = this.gameStateManager.getPartialAllInLeftOver();
        const minimumBet = minRaiseDiff + previousRaise + partialAllInLeftOver;

        const isPlayerAllIn = player.chips === betAmount;

        if (!isPlayerAllIn && betAmount < minimumBet) {
            throw Error(
                `${errorPrefix} Player cannot bet ${betAmount}\nminimum bet is ${minimumBet},` +
                    ` previousRaise is ${previousRaise}, minRaiseDiff is ${minRaiseDiff}, ` +
                    `partialAllInLeftOver is ${partialAllInLeftOver}`,
            );
        }

        // TODO implement this after you implement basic betting, so that you
        // know how betting affects the state
    }

    // Preconditions
    /*
        Player can call if they are not already all-in.
        Player can call if they havent folded
    */
    validateCallAction(clientUUID: string) {
        // this should be all we need, because if a player has folded, it will never be their turn to act,
        // and if they are all in, it shouldn't be their turn to act either.
        this.ensureCorrectPlayerToAct(clientUUID);
    }
}
