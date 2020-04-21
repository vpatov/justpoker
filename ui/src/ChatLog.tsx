import React from "react";
import { createStyles, withStyles, WithStyles, Theme } from "@material-ui/core/styles";
import {scroll, scroller} from 'react-scroll';
import TextareaAutosize from 'react-textarea-autosize';

import { WsServer } from "./api/ws";
import { UiChatMessage, cleanUiChatLog, testUiChatLog, UiChatLog } from "./shared/models/uiState";

const styles = (theme: Theme) => createStyles({
    root: {
        height: "75vh",
        width: "400px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gridArea: "chatLog",
        border: "2px solid black",
        margin: "20px",
        flexDirection: "column",
        backgroundColor: "rgba(50, 30, 57, 0.3)"
    },
    chatLog: {
        display: "flex",
        flexDirection: "column",
        height:"100%",
        margin: "8px",
        overflowY: "scroll",
        overflowWrap: "break-word",
        width: "95%",
    },
    chatMessage: {
        margin: "5px",
        fontSize: "13px",
        fontFamily: "Ubuntu"
    },
    chatInputSection: {
        alignContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        margin: "8px",
        width: "95%",
    },
    chatInputContainer: {
        marginRight: "20px",
        width: "85%",
    },
    chatInput: {
        backgroundColor: "rgba(201,148,226,0.1)",
        border: "1.5px solid rgba(255,210,210,0.3)",
        borderRadius: "5px",
        color: "blanchedalmond",
        height: "16px",
        fontFamily: "Ubuntu",
        fontSize: "12px",
        marginBottom: "0px",
        marginTop: "0px",
        padding: "8px",
        resize: "none",
        width: "calc(100% - 7px)",

    },
    buttonContainer: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },
    sendButton : {
        backgroundColor: "black",
        borderBottomStyle: "hidden",
        borderLeftStyle: "hidden",
        borderRightStyle: "hidden",
        borderTopStyle: "hidden",
        borderRadius: "10px",
        color: "rgb(200,150,240)",
        fontFamily: "Ubuntu",
        height:"32.66px",
        marginTop: "auto",
        padding: "6px",
        textTransform: "uppercase",
        width: "100%",
    },

    senderName: {
        color: "rgb(255, 163, 97)",
        fontSize: "15px",
        marginRight: "8px",
    },
    messageContent: {
        color: "rgb(220,210,230)"
    },

});

declare interface ChatLogState {
    chatLog: UiChatLog;
    draftChatMessage: string;
    isScrolledToBottom: boolean;
}

interface ChatLogProps extends WithStyles<typeof styles> {}

class ChatLog extends React.Component<ChatLogProps,ChatLogState>  {
    bottomOfChatLog: HTMLDivElement|null = null;
    chatLogComponent: HTMLDivElement|null = null;

    constructor(props){
        super(props);
        this.state = {chatLog: {messages: []}, draftChatMessage: "", isScrolledToBottom: true};

    }

    setDraftChatMessage(newDraftChatMessage: string){
        this.setState((state, props) => ({
            draftChatMessage: newDraftChatMessage,
        }));
    }

    sendMessage(){
        WsServer.sendChatMessage(this.state.draftChatMessage);
        this.setDraftChatMessage("");
    }

    onTextAreaPressEnter(event: KeyboardEvent){
        if (event.key === "Enter" && !event.shiftKey){
            event.preventDefault();
            this.sendMessage();
        }
    }

    onReceiveNewChatMessage(chatMessage: UiChatMessage) {
        this.setState((state, props) => ({
            chatLog: {messages: [...state.chatLog.messages, chatMessage]},
            draftChatMessage: state.draftChatMessage
        }));
    };

    componentDidUpdate(){
        if (this.state.isScrolledToBottom){
            this.scrollToBottom();
        }
    }

    componentDidMount() {
        WsServer.subscribe(
            "chat",
            (newChatMessage) => this.onReceiveNewChatMessage(newChatMessage),
        );
        this.chatLogComponent!.addEventListener('scroll', this.listenToScroll)
    }
      
    componentWillUnmount() {
        this.chatLogComponent!.removeEventListener('scroll', this.listenToScroll)
    }
      
    // if the user is currently scrolled close to the bottom, consider them scroll to the bottom and autoscroll them down when
    // new messages come in
    listenToScroll = () => {
        const clientHeight = this.chatLogComponent!.clientHeight;
        const scrollTop = this.chatLogComponent!.scrollTop;
        const scrollHeight = this.chatLogComponent!.scrollHeight;
        this.setState((state, props) => ({isScrolledToBottom: Math.abs(scrollHeight - (scrollTop + clientHeight)) < 25}));
    }

    scrollToBottom = () => {
        this.bottomOfChatLog!.scrollIntoView({ behavior: "smooth" });
    }
      
    render() { 
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <div 
                    className={classes.chatLog}
                    ref={(element) => {this.chatLogComponent = element;}}
                >
                    {this.state.chatLog.messages.map((message) => (
                        <span 
                            key={message.timestamp}
                            className={classes.chatMessage}
                        >
                            <label className={classes.senderName}>
                                {message.senderName}:
                            </label>
                            <label className={classes.messageContent}>
                                {message.content}   
                            </label>
                        </span>
                    ))}
                    <div style={{ float:"left", clear: "both" }}
                        ref={(element) => { this.bottomOfChatLog = element; }}>
                     </div>
                </div>

                <div className={classes.chatInputSection}>
                    <div className={classes.chatInputContainer}>
                        <TextareaAutosize 
                            className={classes.chatInput} maxRows={3}
                            value={this.state.draftChatMessage}
                            onKeyDown={(event) => this.onTextAreaPressEnter(event)}
                            onChange={(event) => this.setDraftChatMessage(event.target.value)}
                        >
                        </TextareaAutosize>
                    </div>
                    <div className={classes.buttonContainer}>
                        <button 
                            className={classes.sendButton}
                            onClick={(event) => this.sendMessage()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(ChatLog);
