import React, { useState, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import classnames from 'classnames';
import Button from '@material-ui/core/Button';

import { WsServer } from './api/ws';
import { UiChatMessage, UiHandLogEntry } from './shared/models/uiState';
import { useStickyState, } from './utils';
import { ButtonGroup } from '@material-ui/core';

import blueGrey from '@material-ui/core/colors/blueGrey';
import ChatLog from './ChatLog';
import HandLog from './HandLog';


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

    const [hideChatLog, setHideChatLog] = useStickyState(false, CHAT_OPEN_LOCAL_STORAGE_KEY);
    const [hideHandLog, setHideHandLog] = useStickyState(false, HANDLOG_OPEN_LOCAL_STORAGE_KEY);
    const [unreadChats, setUnreadChats] = useState(false);
    const [chatMessages, setChatMessages] = useState([] as UiChatMessage[]);
    const [draftChatMessage, setDraftChatMessage] = useState('');

    const [handLogEntries, setHandLogEntries] = useState([] as UiHandLogEntry[]);
    const [currentHandNumber, setCurrentHandNumber] = useState(0);

    useEffect(() => {
        WsServer.subscribe('chat', onReceiveNewChatMessage);
        WsServer.subscribe('handLogEntries', onReceiveNewHandLogEntries);
        WsServer.ping(); // first game state update comes before subscriptions, so need to ping.
    }, []);

    function onReceiveNewChatMessage(chatMessage: UiChatMessage) {
        setUnreadChats(true);
        setChatMessages((oldMessages) => [...oldMessages, chatMessage]);
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

    // TODO consider toggle display none instead of handling data in this component
    function renderHandLog(){
        return (
            <HandLog
                hideChatLog={hideChatLog}
                hideHandLog={hideHandLog}
                handLogEntries={handLogEntries}
                setHandLogEntries={setHandLogEntries}
                currentHandNumber={currentHandNumber}
                setCurrentHandNumber={setCurrentHandNumber}
            />
        );
    }

    // TODO consider toggle display none for child instead of handling data in this component
    function renderChatLog(){
        return (
            <ChatLog
                hideChatLog={hideChatLog}
                hideHandLog={hideHandLog}
                unreadChats={unreadChats}
                setUnreadChats={setUnreadChats}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                draftChatMessage={draftChatMessage}
                setDraftChatMessage={setDraftChatMessage}
            />
        );
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

    if (!hideChatLog || !hideHandLog) {
        return renderSharedLogPanel();
    } else {
        return renderMessagePanelButtons();
    }
}

export default LogPanel;
