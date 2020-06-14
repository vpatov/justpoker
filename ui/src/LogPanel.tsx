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
        noDisplay: {
            display: 'none'
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

    function renderHandLog(){
        return (
            <HandLog
                hideChatLog={hideChatLog}
                hideHandLog={hideHandLog}
            />
        );
    }

    function renderChatLog(){
        return (
            <ChatLog
                hideChatLog={hideChatLog}
                hideHandLog={hideHandLog}
                setUnreadChats={setUnreadChats}
            />
        );
    }

    function renderSharedLogPanel() {
        return (
            <>
                <div 
                    className={classnames(classes.root, className)}
                    style={hideChatLog && hideHandLog ? {display: 'none'} : {}}
                >
                    {renderHandLog()}
                    {renderChatLog()}
                </div>
                {renderMessagePanelButtons()}
            </>
        )
    }

    return renderSharedLogPanel();

}

export default LogPanel;
