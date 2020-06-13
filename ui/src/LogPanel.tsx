import React, { useState, useEffect, useRef } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import classnames from 'classnames';
import get from 'lodash/get';

import TextFieldWrap from './reuseable/TextFieldWrap';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import EmojiPicker from './EmojiPicker';

import { WsServer } from './api/ws';
import { UiChatMessage, UiHandLogEntry, UiCard } from './shared/models/uiState';
import { getPlayerNameColor } from './style/colors';
import { useStickyState, generateStringFromRank } from './utils';
import { ButtonGroup, IconButton, Divider } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import { PlayerSummary, BettingRoundLog, BetActionRecord, PotSummary, ShowdownHand, PotWinner } from './shared/models/handLog';
import { PlayerPositionString } from './shared/models/playerPosition';
import Suit from './Suit';

import blueGrey from '@material-ui/core/colors/blueGrey';
import { BettingRoundActionType } from './shared/models/game';
import { PlayerUUID } from './shared/models/uuid';



const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: 5,
            height: '100%',
            maxHeight: '100%',
            width: '15%',
            ...theme.custom.LOGPANEL,
        },
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
        handLogPotSummary: {
            fontSize: '1.8vmin',
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
        logPanelDivider: {},
        chatLogContainer: {
            display: 'flex',
            height: '100%',
            flexShrink: 0,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'column',
        },
        chatLogMessages: {
            paddingTop: '1vh',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            overflowY: 'auto',
            overflowWrap: 'anywhere',
        },

        chatLogInputSection: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            width: '100%',
            paddingTop: '2vmin',
            overflow: 'hidden',
        },
        sendButton: {
            fontSize: '1vmin',
            marginRight: '1vmin',
        },
        messageTextField: {
            flexGrow: 1,
            margin: '-0.15vh -0.15vw',
            marginTop: 0,
        },
        messageInput: {
            paddingLeft: '1.2vmin',
            paddingRight: '1.2vmin',
            paddingTop: '1vmin',
            paddingBottom: '1.2vmin',
            width: '82%',
        },
        emojiPicker: {
            position: 'absolute',
            right: '0.25vw',
        },
        chatMessage: {
            margin: '0.2vh 0.4vw',
            fontSize: '1.4vmin',
        },
        senderName: {
            fontWeight: 'bold',
            // color: 'rgb(255, 163, 97)',
            marginRight: '8px',
        },
        messageContent: {
            color: 'rgb(220,210,230)',
        },
        hideButtonGroup: {
            zIndex: 5,
            position: 'absolute',
            bottom: '18%',
            right: 15,
        },
        hideButton: {
            fontSize: '1vmin',
        },
        unread: {
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
        },
    }),
);

interface LogPanelProps {
    className?: string;
}

const CHAT_OPEN_LOCAL_STORAGE_KEY = 'jp-chat-open';
const HANDLOG_OPEN_LOCAL_STORAGE_KEY = 'jp-handlog-open';

function LogPanel(props: LogPanelProps) {
    const classes = useStyles();

    const { className } = props;


    const [hideHandLog, setHideHandLog] = useStickyState(false, HANDLOG_OPEN_LOCAL_STORAGE_KEY);
    const [handLogEntries, setHandLogEntries] = useState([] as UiHandLogEntry[]);
    const [currentHandNumber, setCurrentHandNumber] = useState(0);
    const [hideChatLog, setHideChatLog] = useStickyState(false, CHAT_OPEN_LOCAL_STORAGE_KEY);
    const [chatMessages, setChatMessages] = useState([] as UiChatMessage[]);
    const [draftChatMessage, setDraftChatMessage] = useState('');
    const [unreadChats, setUnreadChats] = useState(false);

    const messagesRef = useRef(null);
    const playerSummaryMap: {[uuid: string]: PlayerSummary} = {};

    const scrollToBottom = () => {
        (get(messagesRef, 'current') || { scrollIntoView: (_) => null }).scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [chatMessages, hideChatLog]);

    useEffect(() => {
        WsServer.subscribe('chat', onReceiveNewChatMessage);
        WsServer.subscribe('handLogEntries', onReceiveNewHandLogEntries);
        WsServer.ping(); // first game state update comes before subscriptions, so need to ping.
    }, []);

    function sendMessage() {
        const trimmedMessage = draftChatMessage.trim();
        if (trimmedMessage) {
            WsServer.sendChatMessage(trimmedMessage);
            setDraftChatMessage('');
        }
    }

    function onTextAreaPressEnter(event: any) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
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
                oldHandLogEntries[handNumber] = handLogEntry;
                return [...oldHandLogEntries];
            }

            // If we received more than one handLogEntry, replace the entire list
            return incomingHandLogEntries;
        })
    }

    function onReceiveNewChatMessage(chatMessage: UiChatMessage) {
        setUnreadChats(true);
        setChatMessages((oldMessages) => [...oldMessages, chatMessage]);
    }

    function renderMessagePanelButtons() {
        return (
            <ButtonGroup
                orientation="vertical"
                className={classnames(classes.hideButtonGroup)}
                style={hideHandLog && hideChatLog ? {} : { right: 'calc(15% + 15px)' }}
            >
                {renderHideHandLogButton()}
                {renderHideChatButton()}
            </ButtonGroup>
        )
    }

    function renderHideHandLogButton() {
        return (
            <Button
                variant="outlined"
                className={classnames(classes.hideButton)}
                onClick={(e) => {
                    setHideHandLog(!hideHandLog);
                }}
            >
                {`${hideHandLog ? 'Show' : 'Hide'}  Log`}
            </Button>
        );
    }

    function renderHideChatButton() {
        return (
            <Button
                variant="outlined"
                className={classnames(classes.hideButton, {
                    [classes.unread]: unreadChats && hideChatLog,
                })}
                onClick={(e) => {
                    setUnreadChats(false);
                    setHideChatLog(!hideChatLog);
                }}
            >
                {`${hideChatLog ? 'Show' : 'Hide'} Chat`}
            </Button>
        );
    }
    const addEmoji = (emoji) => {
        setDraftChatMessage(draftChatMessage + emoji.native);
    };

    function renderLogPanelDivider() {
        return !hideHandLog && !hideChatLog ?
            <div className={classnames(classes.logPanelDivider)}>
                <Divider />
            </div> :
            null;
    }

    function renderSharedLogPanel() {
        return (
            <div className={classnames(classes.root, className)}>
                {hideHandLog ? null : renderHandLog()}
                {hideChatLog ? null : renderChatLog()}
                {renderMessagePanelButtons()}
            </div>
        )
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
        if (currentHandNumber >= handLogEntries.length - 1){
            return;
        }
        setCurrentHandNumber((currentHandNumber) => currentHandNumber + 1);
    }

    function handleClickPreviousButton(){
        if (currentHandNumber >= 0){
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
                        <SkipPreviousIcon></SkipPreviousIcon>
                    </IconButton>
                    <IconButton
                        className={classes.handLogIconButton}
                        onClick={() => handleClickPreviousButton()}
                    >
                        <NavigateBeforeIcon></NavigateBeforeIcon>
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
                        <NavigateNextIcon></NavigateNextIcon>
                    </IconButton>
                    <IconButton
                        className={classes.handLogIconButton}
                        onClick={() => handleClickSkipNextButton()}
                    >
                        <SkipNextIcon></SkipNextIcon>
                    </IconButton>
                </div>
            </div>
        )
    }

    function renderPlayerPosition(playerUUID: PlayerUUID){
        const playerSummary = handLogEntries[currentHandNumber].playerSummaries[playerUUID];
        return playerSummary.wasDealtIn ? (
            <Typography className={classnames(classes.handLogPlayerSummary)}>
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
                {playersSortedByPosition.map((playerPosition) => (renderPlayerPosition(playerPosition)))}
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
                {`${name}`}
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
                {actions.map((action) => {
                    const playerSummary = playerSummaries[action.playerUUID];
                    return (
                    <Typography className={classnames(classes.handLogBettingRoundAction)}>
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

    function renderBettingRoundLog(bettingRoundLog: BettingRoundLog){
        return (
            <div>
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
                {bettingRounds.map((bettingRound) => renderBettingRoundLog(bettingRound))}
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
                {playerHands.map((playerHand) => {
                    const playerSummary = playerSummaries[playerHand.playerUUID];
                    return (
                        <Typography className={classnames(classes.handLogContentLabel)}>
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
              {winners.map((winner) => {
                  const playerSummary = playerSummaries[winner.playerUUID];
                  return (
                      <Typography className={classnames(classes.handLogContentLabel)}>
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
                {potSummaries.map((potSummary) => {
                    return (
                        <Typography className={classnames(classes.handLogPotSummary)}>
                            <div>Pot: {potSummary.amount}</div>
                            {renderPlayerHands(potSummary.playerHands)}
                            {renderPotWinners(potSummary.winners)}
                        </Typography>
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

    function renderHandLog() {
        return (
            <div
                className={classnames(classes.handLogContainer, className)}
                style={!hideChatLog ? {height: '50%', maxHeight: '50%'} : { }}
            >
                <div>
                    {renderHandLogControls()}
                    {renderHandLogEntry()}
                </div>
                {!hideChatLog ? renderLogPanelDivider(): null}
            </div>
        );
    }

    function renderChatLog() {
        return (
            <div
                className={classnames(classes.chatLogContainer, className)}
                style={!hideHandLog ? {height: '50%'} : { }}
            >
                <div className={classes.chatLogMessages}>
                    {chatMessages.map((message) => (
                        <Typography key={message.timestamp} className={classes.chatMessage}>
                            <span
                                className={classes.senderName}
                                style={{ color: getPlayerNameColor(message.seatNumber) }}
                            >
                                {message.senderName}:
                            </span>
                            <span className={classes.messageContent}>{message.content}</span>
                        </Typography>
                    ))}
                    <div ref={messagesRef} />
                </div>
                <div className={classes.chatLogInputSection}>
                    <TextFieldWrap
                        placeholder="Send Message"
                        value={draftChatMessage}
                        className={classes.messageTextField}
                        onChange={(event) => {
                            setDraftChatMessage(event.target.value);
                        }}
                        InputProps={{ classes: { input: classes.messageInput } }}
                        onKeyPress={(event) => onTextAreaPressEnter(event)}
                        multiline={true}
                        rowsMax={7}
                        maxChars={300}
                    />

                    <EmojiPicker
                        className={classes.emojiPicker}
                        onSelect={addEmoji}
                        recent={[
                            'sweat_smile',
                            'joy',
                            'expressionless',
                            'face_with_sumbols_on_mouth',
                            'man_faceplaming',
                            'bomb',
                            'moneybag',
                            'honey_pot',
                            'cookie',
                            '100',
                            'pray',
                            'skull_and_crossbones',
                            'interrobang',
                            'ok',
                            'cool',
                            'spades',
                            'hearts',
                            'diamonds',
                            'clubs',
                            'black_joker',
                        ]}
                        useButton={false}
                    />
                </div>
                {renderMessagePanelButtons()}
            </div>
        );
    }

    if (!hideChatLog || !hideHandLog) {
        return renderSharedLogPanel();
    } else {
        return renderMessagePanelButtons();
    }
}

export default LogPanel;
