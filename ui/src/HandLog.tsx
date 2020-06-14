import React, { useState, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import classnames from 'classnames';

import Typography from '@material-ui/core/Typography';

import { UiHandLogEntry, UiCard } from './shared/models/ui/uiState';
import { getPlayerNameColor } from './style/colors';
import { generateStringFromRank } from './utils';
import { IconButton, Divider } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import { BettingRoundLog, BetActionRecord, PotSummary, ShowdownHand, PotWinner } from './shared/models/state/handLog';
import { PlayerPositionString } from './shared/models/player/playerPosition';
import Suit from './Suit';

import blueGrey from '@material-ui/core/colors/blueGrey';
import { BettingRoundActionType } from './shared/models/game/game';
import { PlayerUUID } from './shared/models/system/uuid';
import { WsServer } from './api/ws';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        handLogContainer: {
            backgroundColor: 'rgba(12,0,12,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto',
        },
        handLogControls: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        handLogControlButtonSection: {
            display: 'flex',
        },
        handLogIconButton: {
            borderRadius: '25%',
        },
        handLogBettingRoundAction: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.8vmin',
        },
        handLogIcon: {
            fontSize: '2.0vmin',
        },
        handNumberString: {
            fontSize: '1.6vmin',
        },
        timeHandStartedLabel: {
            fontSize: '1.4vmin',
        },
        handLogContents: {
            margin: '0.2vh 0.40vw',
            '& > *':{
                marginBottom: '1.2vh'    
            },
            color: 'rgb(220,210,230)',
        },
        handLogContentLabel: {
            fontSize: '1.8vmin',
        },
        handLogSectionLabel: {
            textTransform: 'uppercase',
            fontSize: '2.2vmin',
            color: blueGrey[700],
        },
        handLogPotWinnerLabel: {
            fontSize: '1.8vmin',  
        },
        handLogShowHandLabel: {
            fontSize: '1.8vmin',
        },
        handLogInlineCards: {
            display: 'flex',
            alignItems: 'center',

            fontSize: '2.2vmin',
            '& > *':{
                marginRight: '0.3vw'    
            }
        },
        playerNameWithColor: {
            fontSize: '1.8vmin',
        },
        suit: {
            width: '2.2vmin',
            height: '2.2vmin',
            marginLeft: '0.1vw',
        },
        handLogPlayerSummary: {
            fontSize: '1.8vmin',
        },

        hideButton: {
            fontSize: '1vmin',
        },
    }),
);

declare type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface HandLogProps {
    hideChatLog: boolean;
    hideHandLog: boolean;
}

function HandLog(props: HandLogProps) {
    const classes = useStyles();
    const {hideChatLog, hideHandLog} = props;


    const [handLogEntries, setHandLogEntries] = useState([] as UiHandLogEntry[]);
    const [currentHandNumber, setCurrentHandNumber] = useState(0);

    useEffect(() => {
        WsServer.subscribe('handLogEntries', onReceiveNewHandLogEntries);
        WsServer.ping(); // first game state update comes before subscriptions, so need to ping.
    }, []);

    function getCurrentHandNumber() {
        return currentHandNumber;
    }

    function onReceiveNewHandLogEntries(incomingHandLogEntries: UiHandLogEntry[]){
        if (!incomingHandLogEntries || !incomingHandLogEntries.length || !incomingHandLogEntries[0] ){
            return;
        }
        setHandLogEntries((oldHandLogEntries) => {
            // update the most recent entry
            if (incomingHandLogEntries.length === 1){
                const handLogEntry = incomingHandLogEntries[0];
                const handNumber = handLogEntry.handNumber;
                if (handNumber === oldHandLogEntries.length){
                    setCurrentHandNumber((oldHandNumber) => {
                        return oldHandNumber === oldHandLogEntries.length - 2 ? oldHandNumber + 1 : oldHandNumber;
                    });
                }
                
                oldHandLogEntries[handNumber] = handLogEntry;
                return [...oldHandLogEntries];
            }

            // If we received more than one handLogEntry, replace the entire list
            return incomingHandLogEntries;
        })
    }


    function getHandNumberString(){
        if (handLogEntries.length === 0){
            return 'No entries';
        }
        return `${currentHandNumber + 1} of ${handLogEntries.length}`;

    }

    function handleClickSkipPreviousButton() {
        setCurrentHandNumber(0);
    }

    function handleClickSkipNextButton() {
        if (handLogEntries.length){
            setCurrentHandNumber(handLogEntries.length - 1);
        }
    }

    function handleClickNextButton(){
        if (currentHandNumber < handLogEntries.length - 1){
            setCurrentHandNumber((currentHandNumber) => currentHandNumber + 1);
        }
    }

    function handleClickPreviousButton(){
        if (currentHandNumber > 0){
            setCurrentHandNumber((currentHandNumber) => currentHandNumber - 1);
        }
    }

    function renderHandLogControls() {
        const handNumberString = getHandNumberString();
        return (
            <div className={classnames(classes.handLogControls)}>
                <div className={classnames(classes.handLogControlButtonSection)}>
                    <IconButton
                        className={classes.handLogIconButton}
                        onClick={() => handleClickSkipPreviousButton()}
                    >
                        <SkipPreviousIcon/>
                    </IconButton>
                    <IconButton
                        className={classes.handLogIconButton}
                        onClick={() => handleClickPreviousButton()}
                    >
                        <NavigateBeforeIcon/>
                    </IconButton>
                </div>
                <Typography
                    className={classes.handNumberString}
                    style={handNumberString.length >= 11 ? {fontSize: '1.3vmin'} : {}}
                    >
                    {handNumberString}
                </Typography>
                <div className={classnames(classes.handLogControlButtonSection)}>
                    <IconButton
                        className={classes.handLogIconButton}
                        onClick={() => handleClickNextButton()}
                    >
                        <NavigateNextIcon/>
                    </IconButton>
                    <IconButton
                        className={classes.handLogIconButton}
                        onClick={() => handleClickSkipNextButton()}
                    >
                        <SkipNextIcon/>
                    </IconButton>
                </div>
            </div>
        )
    }

    function renderPlayerPosition(playerUUID: PlayerUUID, index:number){
        const playerSummary = handLogEntries[currentHandNumber].playerSummaries[playerUUID];
        return playerSummary.wasDealtIn ? (
            <Typography className={classnames(classes.handLogPlayerSummary)} key={index}>
                <span>
                    {`${PlayerPositionString[playerSummary.position]}: `}
                </span>
                {renderPlayerName(playerSummary.seatNumber, playerSummary.playerName)}
                <span>{` (${playerSummary.startingChips})`}</span>
            </Typography>
        ) : null;
    }

    function renderPlayerPositions(playersSortedByPosition: PlayerUUID[]){
        return (
            <div>
                <Typography className={classes.handLogSectionLabel}>
                    Players
                </Typography>
                <Divider/>
                {playersSortedByPosition.map((playerPosition,index) => (renderPlayerPosition(playerPosition,index)))}
            </div>
        );
    }

    function renderCardsInline(cards: UiCard[]){
        return (
            <Typography className={classes.handLogInlineCards}>
                {cards.map((card) => (
                    <>
                        {generateStringFromRank(card.rank)}
                        <Suit className={classes.suit} suit={card.suit}></Suit>
                    </>
                ))}
            </Typography>  
        );
    }

    function renderBoard(board: UiCard[]){
        return board?.length ? (
            <div>
                <Typography className={classes.handLogSectionLabel}>
                    Board
                </Typography>
                <Divider />
                {renderCardsInline(board)}   
            </div>
        ) : null;
    }

    function getBetActionVerbString(bettingRoundAction: BettingRoundActionType, amount?: number){
        switch (bettingRoundAction){
            case BettingRoundActionType.CHECK: {
                return 'checks.';
            }
            case BettingRoundActionType.FOLD: {
                return 'folds.';
            }
            case BettingRoundActionType.BET: {
                return `bets ${amount !== undefined ? amount : 'unknown value'}.`;
            }
            case BettingRoundActionType.CALL: {
                return `calls ${amount !== undefined ? amount : 'unknown value'}.`;
            }
            default: {
                return '';
            }
        }
    }
    
    function renderBettingRoundAction(action: BetActionRecord){
        return (
            ` ${getBetActionVerbString(action.bettingRoundAction.type, action.bettingRoundAction.amount)}`
        );
    }

    function renderPlayerName(seatNumber: number, name: string){
        return  (
            <span 
                className={classnames(classes.playerNameWithColor)}
                style={{ color: getPlayerNameColor(seatNumber) }}
            >
                {name}
            </span>
        );
    }

    function renderTimeTookToAct(timeTookToAct: number){
        // 1512 -> (1.5s)
        return `(${Math.round(timeTookToAct / 100) / 10}s)`;
    }

    function renderBettingRoundActions(actions: BetActionRecord[]){
        const playerSummaries = handLogEntries[currentHandNumber].playerSummaries;
        return (
            <>
                {actions.map((action, index) => {
                    const playerSummary = playerSummaries[action.playerUUID];
                    return (
                    <Typography className={classnames(classes.handLogBettingRoundAction)} key={index}>
                        <span>
                            {renderPlayerName(playerSummary.seatNumber, playerSummary.playerName)}
                            {renderBettingRoundAction(action)}
                        </span>
                        <span>{renderTimeTookToAct(action.timeTookToAct)}</span>
                    </Typography>);
                })}
            </>
        )
    }

    function renderBettingRoundLog(bettingRoundLog: BettingRoundLog, index: number){
        return (
            <div key={index}>
                <Typography className={classes.handLogSectionLabel}>
                    {bettingRoundLog.bettingRoundStage}
                </Typography>
                <Divider />
                {renderCardsInline(bettingRoundLog.cardsDealtThisBettingRound)}
                {renderBettingRoundActions(bettingRoundLog.actions)}
            </div>
        )
    }

    function renderBettingRoundLogs(bettingRounds: BettingRoundLog[]){
        return (
            <> 
                {bettingRounds.map((bettingRound, index) => renderBettingRoundLog(bettingRound, index))}
            </>
        );

    }

    function renderTimeHandStarted(timeHandStarted: number){
        return timeHandStarted ? 
            <Typography className={classes.timeHandStartedLabel}>
                {new Date(timeHandStarted).toLocaleString().replace(',','')}
            </Typography> : 
        null;
    }

    function renderPlayerHands(playerHands: ShowdownHand[]){
        const playerSummaries = handLogEntries[currentHandNumber].playerSummaries;
        return (
            <>
                {playerHands.map((playerHand, index) => {
                    const playerSummary = playerSummaries[playerHand.playerUUID];
                    return (
                        <Typography className={classnames(classes.handLogContentLabel)} key={index}>
                            {renderPlayerName(playerSummary.seatNumber, playerSummary.playerName)}
                            {playerHand.handDescription ? ` shows ${playerHand.handDescription}.` : ` doesn't show.`}
                        </Typography>
                    );
                })}
            </>
        )

    }

    function renderPotWinners(winners: PotWinner[]){
        const playerSummaries = handLogEntries[currentHandNumber].playerSummaries;
        return (
            <>
              {winners.map((winner, index) => {
                  const playerSummary = playerSummaries[winner.playerUUID];
                  return (
                      <Typography className={classnames(classes.handLogContentLabel)} key={index}>
                          {renderPlayerName(playerSummary.seatNumber, playerSummary.playerName)}
                          {` wins ${winner.amount}`}
                      </Typography>
                  );
              })}
            </>
        );

    }

    function renderPotSummaries(potSummaries: PotSummary[]){
        const playerSummaries = handLogEntries[currentHandNumber].playerSummaries;
        return (
            <div>
                <Typography className={classes.handLogSectionLabel}>
                    Result
                </Typography>
                <Divider />
                {potSummaries.map((potSummary, index) => {
                    return (
                        <React.Fragment key={index}>
                            <Typography className={classnames(classes.handLogContentLabel)}>
                                Pot: {potSummary.amount}
                            </Typography>
                            <>
                                {renderPlayerHands(potSummary.playerHands)}
                                {renderPotWinners(potSummary.winners)}
                            </>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    }

    function renderHandLogEntry() {
        if (handLogEntries.length === 0){
            return null;
        }

        const handLogEntry = handLogEntries[currentHandNumber];
        if (!handLogEntry){
            return null;
        }

        return (
            <div className={classnames(classes.handLogContents)}>
                {renderTimeHandStarted(handLogEntry.timeHandStarted)}
                {renderPlayerPositions(handLogEntry.playersSortedByPosition)}
                {renderBoard(handLogEntry.board)}
                {renderBettingRoundLogs(handLogEntry.bettingRounds)}
                {handLogEntry.potSummaries.length ? renderPotSummaries(handLogEntry.potSummaries) : null}
            </div>
        );
        
    }

    function displayStyle(){
        return {
            height: !hideChatLog ? '50%' : undefined,
            maxHeight: !hideChatLog ? '50%' : undefined,
            display: hideHandLog ? 'none' : undefined
        };
    }


    function renderLogPanelDivider() {
        return !hideHandLog && !hideChatLog ?
            <div><Divider /> </div> :
            null;
    }

    return (
        <div
            className={classnames(classes.handLogContainer)}
            style={displayStyle()}
        >
            <div>
                {renderHandLogControls()}
                {renderHandLogEntry()}
            </div>
            {!hideChatLog ? renderLogPanelDivider(): null}
        </div>
    );
    

}

export default HandLog;