import React, { useEffect, useRef } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import classnames from 'classnames';
import get from 'lodash/get';

import TextFieldWrap from './reuseable/TextFieldWrap';

import Typography from '@material-ui/core/Typography';

import EmojiPicker from './EmojiPicker';

import { WsServer } from './api/ws';
import { UiChatMessage} from './shared/models/uiState';
import { getPlayerNameColor } from './style/colors';

const useStyles = makeStyles((theme: Theme) =>
createStyles({
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

// TODO Even if user chooses emoji, it doesnt get added to recent because these are recomputed every mount
const defaultRecentEmojis = ['sweat_smile','joy','expressionless','face_with_sumbols_on_mouth','man_faceplaming','bomb','moneybag',
'honey_pot','cookie','100','pray','skull_and_crossbones','interrobang','ok','cool','spades','hearts','diamonds','clubs','black_joker',];

declare type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface ChatLogProps {
    hideChatLog: boolean;
    hideHandLog: boolean;
    unreadChats: boolean;
    setUnreadChats: Setter<boolean>;
    chatMessages: UiChatMessage[];
    setChatMessages: Setter<UiChatMessage[]>;
    draftChatMessage: string;
    setDraftChatMessage: Setter<string>;
}

function ChatLog(props: ChatLogProps) {
    const {hideChatLog, hideHandLog, unreadChats, setUnreadChats, chatMessages, setChatMessages, draftChatMessage, setDraftChatMessage} = props;
    const classes = useStyles();

    const messagesRef = useRef(null);
    const scrollToBottom = () => {
        (get(messagesRef, 'current') || { scrollIntoView: (_) => null }).scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [chatMessages, hideChatLog]);

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

    const addEmoji = (emoji) => {
        setDraftChatMessage(draftChatMessage + emoji.native);
    };

    function renderChatMessages(){
        return (
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
        )
    }

    function renderSendMessageArea(){
        return (
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
        );
    }

    function renderChatLogInputSection() {
        return (
            <div className={classes.chatLogInputSection}>
                {renderSendMessageArea()}
                {renderEmojiPicker()}
            </div>
        );
    }



    function renderEmojiPicker(){
        return (
            <EmojiPicker
                className={classes.emojiPicker}
                onSelect={addEmoji}
                recent={defaultRecentEmojis}
                useButton={false}
                />
        )
    }

    return (
        <div
            className={classnames(classes.chatLogContainer)}
            style={!hideHandLog ? {height: '50%'} : { }}
        >
            {renderChatMessages()}
            {renderChatLogInputSection()}
        </div>
    );
}

export default ChatLog;