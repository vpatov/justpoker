import React, { useState, useEffect, useRef } from "react";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import classnames from 'classnames'
import get from 'lodash/get'

import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";
import Button from "@material-ui/core/Button";

import { WsServer } from "./api/ws";
import {
    UiChatMessage,
} from "./shared/models/uiState";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            height: "100%",
            width: "20%",
            maxWidth: "360px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "column",
            ...theme.custom.CHAT,
        },
        chatLog: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            overflowY: "auto",
            overflowWrap: "break-word",
        },
        chatInputSection: {

            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            width: "100%",
            paddingTop: "2vmin",
            paddingBottom: "1vmin"

        },
        sendButton: {
            fontSize: "1vmin",
            marginRight: "1vmin",

        },
        messageTextField: {
            flexGrow: 1,
            marginRight: "1vmin",
            marginBottom: 0,
            marginTop: 0
        },
        messageTextFieldInput: {
            fontSize: "1vmin",

        },
        chatMessage: {
            margin: "5px",
            fontSize: "1.3vmin",
        },
        senderName: {
            fontWeight: "bold",
            color: "rgb(255, 163, 97)",
            marginRight: "8px",
        },
        messageContent: {
            color: "rgb(220,210,230)",
        }
    }),
);


interface ChatLogProps {
    className?: string
    hideChat: boolean
}


function ChatLog(props: ChatLogProps) {
    const classes = useStyles();

    const { className, hideChat } = props;

    const [messages, setMessages] = useState([] as any);
    const [draftMessage, setDraftMessage] = useState("");

    const messagesRef = useRef(null)

    const scrollToBottom = () => {
        (get(messagesRef, 'current') || { scrollIntoView: (_) => null }).scrollIntoView({ behavior: "smooth" })
    }

    useEffect(scrollToBottom, [messages, hideChat]);

    useEffect(() => {
        const succ = WsServer.openWs();
        if (succ) {
            WsServer.subscribe("chat", onReceiveNewChatMessage);
        }

    }, []);

    function sendMessage() {
        WsServer.sendChatMessage(draftMessage);
        setDraftMessage("");
    }

    // onTextAreaPressEnter(event: KeyboardEvent) {
    //     if (event.key === "Enter" && !event.shiftKey) {
    //         event.preventDefault();
    //         this.sendMessage();
    //     }
    // }

    function onReceiveNewChatMessage(chatMessage: UiChatMessage) {
        setMessages(oldMessages => [...oldMessages, chatMessage])
    }



    function renderChat() {
        return (
            <Slide in mountOnEnter unmountOnExit direction="left">
                <div className={classnames(classes.root, className)}>
                    <div className={classes.chatLog}  >
                        {messages.map((message) => (
                            <Typography
                                key={message.timestamp}
                                className={classes.chatMessage}
                            >
                                <span className={classes.senderName}>
                                    {message.senderName}:
                            </span>
                                <span className={classes.messageContent}>
                                    {message.content}
                                </span>
                            </Typography>
                        ))}
                        <div ref={messagesRef} />
                    </div>
                    <div className={classes.chatInputSection}>
                        <TextField
                            variant="outlined"
                            value={draftMessage}
                            className={classes.messageTextField}
                            margin="dense"
                            onChange={(event) =>
                                setDraftMessage(event.target.value)
                            }
                            InputProps={{
                                classes: {
                                    input: classes.messageTextFieldInput,
                                },
                            }}
                            multiline
                            rowsMax={4}
                        />
                        <Button
                            className={classes.sendButton}
                            onClick={(e) =>
                                sendMessage()
                            }
                        >
                            Send
                        </Button>
                    </div>

                </div>
            </Slide>

        );
    }


    if (!hideChat) {
        return renderChat()
    } else {
        return null
    }
}

export default ChatLog
