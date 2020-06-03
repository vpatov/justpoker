import { Service } from 'typedi';
import {PlayerPosition, GameInstanceLog, getCleanGameInstanceLog, HandLog, getCleanHandLog, getCleanPlayerSummaryForHandLog, PlayerSummaryForHandLog} from '../../../ui/src/shared/models/handLog';
import { GameInstanceUUID } from '../../../ui/src/shared/models/uuid';
import { GameStateManager } from './gameStateManager';
import { Player } from '../../../ui/src/shared/models/player';


@Service()
export class GameInstanceLogService {

    private gameInstanceLog: GameInstanceLog;
    private currentHandLog: HandLog;

    constructor(
        private readonly gameStateManager: GameStateManager
    ){}

    initGameInstanceLog(gameInstanceUUID: GameInstanceUUID): void {        
        this.gameInstanceLog = {
            ...getCleanGameInstanceLog(),
            gameInstanceUUID
        };
    }

    getGameInstanceLog(): GameInstanceLog {
        return this.gameInstanceLog;
    }

    loadGameInstanceLog(gameInstanceLog: GameInstanceLog): void {
        this.gameInstanceLog = gameInstanceLog;
    }

    initNewHand(){
        const allPlayers = new Map();
        this.gameStateManager.forEveryPlayer((player) => {
            allPlayers.set(player.uuid,this.initNewPlayerSummaryForHandLog(player));
        });
        this.currentHandLog = {
            ...getCleanHandLog(),
            handNumber: this.gameStateManager.getHandNumber(),
            timeHandStarted: Date.now(),
            allPlayers
        };
    }

    initNewPlayerSummaryForHandLog(player: Player): PlayerSummaryForHandLog{
        return {
            playerUUID: player.uuid,
            startingChips: player.chips,
            holeCards: [...player.holeCards],
            wasDealtIn: player.holeCards.length > 0,
            chipsDelta: 0,
            position: this.gameStateManager.getPlayerPosition(player.uuid),
            showedCards: false,
        };
    }

    /*
    handNumber: number;
    timeHandStarted: number;
    allPlayers: PlayerSummaryForHandLog[];
    winner: PlayerUUID;
    bettingRounds: Map<BettingRoundStage, BettingRoundStageLog>;
    lastBettingRound: BettingRoundStage;
    */


}