import React, { useState, useEffect, useRef } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import classnames from 'classnames';
import get from 'lodash/get';

import TextFieldWrap from './reuseable/TextFieldWrap';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import EmojiPicker from './EmojiPicker';

import { WsServer } from './api/ws';
import { UiChatMessage } from './shared/models/uiState';
import { Popper } from '@material-ui/core';
import { getPlayerNameColor } from './style/colors';
import { playerListSelector } from './store/selectors';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: 5,
            height: '100%',
            display: 'flex',
            flexShrink: '0',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'column',
            width: '15%',
            ...theme.custom.CHAT,
        },
        chatLog: {
            paddingTop: '1vh',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            overflowY: 'auto',
            overflowWrap: 'anywhere',
        },
        chatInputSection: {
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
        hideButton: {
            fontSize: '1vmin',
            zIndex: 5,
            position: 'absolute',
            bottom: '18%',
            right: 15,
        },
        unread: {
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
        },
    }),
);

interface ChatLogProps {
    className?: string;
}
const CHAT_OPEN_LOCAL_STORAGE_KEY = 'jp_chatOpen';

function getChatButtonState(): boolean {
    const cached = localStorage.getItem(CHAT_OPEN_LOCAL_STORAGE_KEY);
    if (cached !== null) {
        return cached === 'true';
    }
    return false;
}

function ChatLog(props: ChatLogProps) {
    const classes = useStyles();

    const { className } = props;

    const [hideChat, setHideChat] = useState(getChatButtonState());
    const [messages, setMessages] = useState([] as any);
    const [draftMessage, setDraftMessage] = useState('');
    const [unreadChats, setUnreadChats] = useState(false);

    const messagesRef = useRef(null);

    const scrollToBottom = () => {
        (get(messagesRef, 'current') || { scrollIntoView: (_) => null }).scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, hideChat]);

    useEffect(() => {
        WsServer.subscribe('chat', onReceiveNewChatMessage);
    }, []);

    function sendMessage() {
        const trimmedMessage = draftMessage.trim();
        if (trimmedMessage) {
            WsServer.sendChatMessage(trimmedMessage);
            setDraftMessage('');
        }
    }

    function onTextAreaPressEnter(event: any) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function onReceiveNewChatMessage(chatMessage: UiChatMessage) {
        setUnreadChats(true);
        setMessages((oldMessages) => [...oldMessages, chatMessage]);
    }

    function renderHideChatButton() {
        return (
            <Button
                variant="outlined"
                className={classnames(classes.hideButton, {
                    [classes.unread]: unreadChats && hideChat,
                })}
                onClick={(e) => {
                    setUnreadChats(false);
                    setHideChat(!hideChat);
                    localStorage.setItem(CHAT_OPEN_LOCAL_STORAGE_KEY, JSON.stringify(!hideChat));
                }}
                style={hideChat ? {} : { right: 'calc(15% + 15px)' }}
            >
                {`${hideChat ? 'Show' : 'Hide'} Chat`}
            </Button>
        );
    }
    const addEmoji = (emoji) => {
        setDraftMessage(draftMessage + emoji.native);
    };

    function renderChat() {
        return (
            <div className={classnames(classes.root, className)}>
                <div className={classes.chatLog}>
                    {messages.map((message) => (
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
                <div className={classes.chatInputSection}>
                    <TextFieldWrap
                        placeholder="Send Message"
                        value={draftMessage}
                        className={classes.messageTextField}
                        onChange={(event) => {
                            setDraftMessage(event.target.value);
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
                {renderHideChatButton()}
            </div>
        );
    }

    if (!hideChat) {
        return renderChat();
    } else {
        return renderHideChatButton();
    }
}

export default ChatLog;
