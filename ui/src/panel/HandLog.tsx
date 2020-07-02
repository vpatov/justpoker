import React, { useState, useEffect, ReactPropTypes, useRef } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import classnames from 'classnames';

import Typography from '@material-ui/core/Typography';

import { UiHandLogEntry, UiCard } from '../shared/models/ui/uiState';
import { getPlayerNameColor } from '../style/colors';
import { generateStringFromRank, scrollToBottom } from '../utils';
import { IconButton, Divider } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import GetAppIcon from '@material-ui/icons/GetApp';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { BettingRoundLog, BetActionRecord, PotSummary, ShowdownHand, PotWinner } from '../shared/models/state/handLog';
import { AbbreviatedPlayerPositionString } from '../shared/models/player/playerPosition';
import Suit from '../reuseable/Suit';

import blueGrey from '@material-ui/core/colors/blueGrey';
import { BettingRoundActionType } from '../shared/models/game/betting';
import { PlayerUUID } from '../shared/models/system/uuid';
import { WsServer } from '../api/ws';
import { cardsAreEqual, Card } from '../shared/models/game/cards';
import { grey } from '@material-ui/core/colors';
import { ASPECT_RATIO_BREAK_POINT } from '../style/Theme';
import { computeHandLogGETurl } from '../api/http';
import { useParams } from 'react-router';

const handLogTextContentSize = '1.5vmin';
const handLogCardSize = '1.8vmin';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
        },
        handLogContainer: {
            height: '100%',
            overflowY: 'auto',
            position: 'relative',
        },
        handLogControls: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgb(10,10,10)',
            width: '100%',
            zIndex: 10,
        },
        handLogControlButtonSection: {
            width: '35%',
        },
        handLogIconButton: {
            borderRadius: '0',
            width: '50%',
        },
        handLogBettingRoundAction: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: handLogTextContentSize,
        },
        handNumberString: {
            fontSize: handLogTextContentSize,
            letterSpacing: '-0.05vmin',
        },
        timeHandStartedLabel: {
            width: '100%',
            fontSize: '1.3vmin',
        },
        handLogContents: {
            margin: '0.2vh 0.40vw',

            '& > *': {
                marginBottom: '1.2vh',
            },
            color: grey[200],
        },
        handLogPlayerPosition: {
            width: '6.2vmin',
            display: 'inline-block',
        },
        handLogContentLabel: {
            fontSize: handLogTextContentSize,
        },
        handLogSectionLabel: {
            textTransform: 'uppercase',
            fontSize: '1.6vmin',
            color: blueGrey[500],
        },
        handLogEntryButtonPanel: {
            marginBottom: '0.4vmin',
            display: 'flex',
            justifyContent: 'space-between',
        },
        handLogPotWinnerLabel: {
            fontSize: handLogTextContentSize,
        },
        handLogShowHandLabel: {
            fontSize: handLogTextContentSize,
        },
        downloadIconButton: {
            width: '3vmin',
            height: '3vmin',
            transform: 'scale(0.9)',
        },
        handLogInlineCards: {
            display: 'flex',
            alignItems: 'center',

            fontSize: handLogCardSize,
            '& > *': {
                marginRight: '0.3vw',
            },
        },
        playerNameWithColor: {
            fontSize: handLogTextContentSize,
        },
        suit: {
            width: handLogCardSize,
            height: handLogCardSize,
            marginLeft: '0.1vw',
        },
        handLogPlayerSummary: {
            fontSize: handLogTextContentSize,
        },

        hideButton: {
            fontSize: '1vmin',
        },
        logPanelDivider: {
            border: '0.25vmin solid #252527',
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
    const { hideChatLog, hideHandLog } = props;
    const { gameInstanceUUID } = useParams();

    const [handLogEntries, setHandLogEntries] = useState([] as UiHandLogEntry[]);
    const [currentHandNumber, setCurrentHandNumber] = useState(0);
    const smallWidth = useMediaQuery(ASPECT_RATIO_BREAK_POINT);
    const smallCurrentHandText = smallWidth || `${currentHandNumber}${handLogEntries.length}`.length >= 4;

    useEffect(() => {
        WsServer.subscribe('handLogEntries', onReceiveNewHandLogEntries);
        WsServer.ping(); // first game state update comes before subscriptions, so need to ping.
    }, []);

    const logRef = useRef(null);
    useEffect(() => scrollToBottom(logRef), [handLogEntries]);

    function onReceiveNewHandLogEntries(incomingHandLogEntries: UiHandLogEntry[]) {
        if (!incomingHandLogEntries || !incomingHandLogEntries.length || !incomingHandLogEntries[0]) {
            return;
        }
        setHandLogEntries((oldHandLogEntries) => {
            // update the most recent entry
            if (incomingHandLogEntries.length === 1) {
                const handLogEntry = incomingHandLogEntries[0];
                const handNumber = handLogEntry.handNumber;
                if (handNumber === oldHandLogEntries.length) {
                    setCurrentHandNumber((oldHandNumber) => {
                        return oldHandNumber === oldHandLogEntries.length - 2 ? oldHandNumber + 1 : oldHandNumber;
                    });
                }

                oldHandLogEntries[handNumber] = handLogEntry;
                return [...oldHandLogEntries];
            }

            // If we received more than one handLogEntry, replace the entire list
            return incomingHandLogEntries;
        });
    }

    function getHandNumberString() {
        if (handLogEntries.length === 0) {
            return 'None';
        }
        if (smallCurrentHandText) {
            return `${currentHandNumber + 1}/${handLogEntries.length}`;
        }
        return `${currentHandNumber + 1} of ${handLogEntries.length}`;
    }

    function handleClickSkipPreviousButton() {
        setCurrentHandNumber(0);
    }

    function handleClickSkipNextButton() {
        if (handLogEntries.length) {
            setCurrentHandNumber(handLogEntries.length - 1);
        }
    }

    function handleClickNextButton() {
        if (currentHandNumber < handLogEntries.length - 1) {
            setCurrentHandNumber((currentHandNumber) => currentHandNumber + 1);
        }
    }

    function handleClickPreviousButton() {
        if (currentHandNumber > 0) {
            setCurrentHandNumber((currentHandNumber) => currentHandNumber - 1);
        }
    }

    function handleClickDownloadButton() {
        window.open(computeHandLogGETurl(gameInstanceUUID), '_blank');
    }

    function renderHandLogControls() {
        const handNumberString = getHandNumberString();
        return (
            <div className={classnames(classes.handLogControls)}>
                <div className={classnames(classes.handLogControlButtonSection)}>
                    <IconButton className={classes.handLogIconButton} onClick={() => handleClickSkipPreviousButton()}>
                        <SkipPreviousIcon />
                    </IconButton>
                    <IconButton className={classes.handLogIconButton} onClick={() => handleClickPreviousButton()}>
                        <NavigateBeforeIcon />
                    </IconButton>
                </div>
                <Typography
                    className={classes.handNumberString}
                    style={smallCurrentHandText ? { fontSize: '1.2vmin' } : {}}
                >
                    {handNumberString}
                </Typography>
                <div className={classnames(classes.handLogControlButtonSection)}>
                    <IconButton className={classes.handLogIconButton} onClick={() => handleClickNextButton()}>
                        <NavigateNextIcon />
                    </IconButton>
                    <IconButton className={classes.handLogIconButton} onClick={() => handleClickSkipNextButton()}>
                        <SkipNextIcon />
                    </IconButton>
                </div>
            </div>
        );
    }

    // TODO this would probably look best as a small table
    function renderPlayerPosition(playerUUID: PlayerUUID, index: number) {
        const playerSummary = handLogEntries[currentHandNumber].playerSummaries[playerUUID];
        return playerSummary.wasDealtIn ? (
            <Typography className={classnames(classes.handLogPlayerSummary)} key={index}>
                <span className={classes.handLogPlayerPosition}>
                    {`${AbbreviatedPlayerPositionString[playerSummary.position]}: `}
                </span>
                {renderPlayerName(playerSummary.seatNumber, playerSummary.playerName)}
                <span>{` (${playerSummary.startingChips})`}</span>
            </Typography>
        ) : null;
    }

    function renderPlayerPositions(playersSortedByPosition: PlayerUUID[]) {
        return (
            <div>
                <Typography className={classes.handLogSectionLabel}>Players</Typography>
                <Divider />
                {playersSortedByPosition.map((playerPosition, index) => renderPlayerPosition(playerPosition, index))}
            </div>
        );
    }

    function renderCardsInline(cards: UiCard[]) {
        return (
            <Typography className={classes.handLogInlineCards}>
                {cards.map((card) => (
                    <>
                        {generateStringFromRank(card.rank)}
                        <Suit className={classes.suit} suit={card.suit} color />
                    </>
                ))}
            </Typography>
        );
    }

    function renderBoard(board: UiCard[]) {
        return board?.length ? (
            <div>
                <Typography className={classes.handLogSectionLabel}>Board</Typography>
                <Divider />
                {renderCardsInline(board)}
            </div>
        ) : null;
    }

    function getBetActionVerbString(bettingRoundAction: BettingRoundActionType, amount?: number) {
        switch (bettingRoundAction) {
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

    function renderBettingRoundAction(action: BetActionRecord) {
        return ` ${getBetActionVerbString(action.bettingRoundAction.type, action.bettingRoundAction.amount)}`;
    }

    function renderPlayerName(seatNumber: number, name: string) {
        return (
            <span className={classnames(classes.playerNameWithColor)} style={{ color: getPlayerNameColor(seatNumber) }}>
                {name}
            </span>
        );
    }

    function renderTimeTookToAct(timeTookToAct: number) {
        // 1512 -> (2s)
        return `(${Math.round(timeTookToAct / 1000)}s)`;
    }

    function renderBettingRoundActions(actions: BetActionRecord[]) {
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
                        </Typography>
                    );
                })}
            </>
        );
    }

    // A 3 5 4 7,    A 3 5    ->    A 3 5
    // A 3 5 4 7,    4     ->       A 3 5 4
    // A 3 5 4 7,    7     ->       A 3 5 4 7
    function getCumulativeCards(board: UiCard[], cardsDealtThisRound: UiCard[]) {
        const cards: UiCard[] = [];
        let [i, j] = [0, 0];
        while (i < board.length && j < cardsDealtThisRound.length) {
            cards.push(board[i]);
            if (cardsAreEqual(board[i] as Card, cardsDealtThisRound[j] as Card)) {
                j += 1;
            }
            i += 1;
        }
        return cards;
    }

    function renderBettingRoundLog(bettingRoundLog: BettingRoundLog, index: number, board: UiCard[]) {
        return (
            <div key={index}>
                <Typography className={classes.handLogSectionLabel}>{bettingRoundLog.bettingRoundStage}</Typography>
                <Divider />
                {renderCardsInline(getCumulativeCards(board, bettingRoundLog.cardsDealtThisBettingRound))}
                {renderBettingRoundActions(bettingRoundLog.actions)}
            </div>
        );
    }

    function renderBettingRoundLogs(bettingRounds: BettingRoundLog[], board: UiCard[]) {
        return <>{bettingRounds.map((bettingRound, index) => renderBettingRoundLog(bettingRound, index, board))}</>;
    }

    function renderTimeHandStarted(timeHandStarted: number) {
        return timeHandStarted ? (
            <Typography className={classes.timeHandStartedLabel}>
                {new Date(timeHandStarted).toLocaleString().replace(',', '')}
            </Typography>
        ) : null;
    }

    function renderPlayerHands(playerHands: ShowdownHand[]) {
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
        );
    }

    function renderPotWinners(winners: PotWinner[]) {
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

    function renderPotSummaries(potSummaries: PotSummary[]) {
        return (
            <div>
                <Typography className={classes.handLogSectionLabel}>Result</Typography>
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

    function renderHandLogEntryButtonPanel(handLogEntry: UiHandLogEntry) {
        return (
            <div className={classnames(classes.handLogEntryButtonPanel)}>
                {renderTimeHandStarted(handLogEntry.timeHandStarted)}
                <IconButton
                    className={classnames(classes.downloadIconButton)}
                    onClick={() => handleClickDownloadButton()}
                >
                    <GetAppIcon />
                </IconButton>
            </div>
        );
    }

    function renderHandLogEntry() {
        if (handLogEntries.length === 0) {
            return null;
        }

        const handLogEntry = handLogEntries[currentHandNumber];
        if (!handLogEntry) {
            return null;
        }

        return (
            <>
                <div className={classnames(classes.handLogContents)}>
                    {renderHandLogEntryButtonPanel(handLogEntry)}
                    {renderPlayerPositions(handLogEntry.playersSortedByPosition)}
                    {renderBoard(handLogEntry.board)}
                    {renderBettingRoundLogs(handLogEntry.bettingRounds, handLogEntry.board)}
                    {handLogEntry.potSummaries.length ? renderPotSummaries(handLogEntry.potSummaries) : null}
                </div>
            </>
        );
    }

    function displayStyle() {
        return {
            height: !hideChatLog ? '50%' : undefined,
            maxHeight: !hideChatLog ? '50%' : undefined,
            display: hideHandLog ? 'none' : undefined,
        };
    }

    function renderLogPanelDivider() {
        return !hideHandLog && !hideChatLog ? (
            <div className={classes.logPanelDivider}>
                <Divider />
            </div>
        ) : null;
    }

    return (
        <div className={classes.root} style={displayStyle()}>
            <div className={classnames(classes.handLogContainer)}>
                {renderHandLogControls()}
                {renderHandLogEntry()}
                <div ref={logRef} />
            </div>
            {!hideChatLog ? renderLogPanelDivider() : null}
        </div>
    );
}

export default HandLog;
