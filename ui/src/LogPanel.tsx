import React, { useState, useEffect, useRef } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import classnames from 'classnames';
import get from 'lodash/get';

import TextFieldWrap from './reuseable/TextFieldWrap';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import EmojiPicker from './EmojiPicker';

import { WsServer } from './api/ws';
import { UiChatMessage, UiHandLogEntry } from './shared/models/uiState';
import { getPlayerNameColor } from './style/colors';
import { useStickyState } from './utils';
import { ButtonGroup, IconButton } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';



const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: 5,
            height: '100%',
            maxHeight: '100%',
            width: '15%',
            ...theme.custom.CHAT,
        },
        handLogContainer: {
            height: '100%',
            backgroundColor: '#ddaadd',
        },
        handLogControls: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        handLogIconButton: {
            borderRadius: '25%',
        },
        handLogIcon: {
            fontSize: '2.5vmin',
        },
        handNumberString: {
            fontSize: '1.6vmin',
        },
        chatLogContainer: {
            display: 'flex',
            height: '100%',
            flexShrink: '0',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'column',
            ...theme.custom.CHAT,
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
    console.log("function LogPanel");
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
        console.log("handLogEntries", handLogEntries);
        if (!incomingHandLogEntries || !incomingHandLogEntries.length || !incomingHandLogEntries[0] ){
            return;
        }
        setHandLogEntries((oldHandLogEntries) => {
            console.log("updating hand log entries");
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
                {`${hideHandLog ? 'Show' : 'Hide'} Hand Log`}
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

    }

    function renderHandLog() {
        console.log("renderHandLog");
        const handNumberString = getHandNumberString();
        return (
            <div
                className={classnames(classes.handLogContainer, className)}
                style={!hideChatLog ? {height: '50%'} : { }}
            >
                <div className={classnames(classes.handLogControls)}>
                    <div>
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
                    <div>
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
