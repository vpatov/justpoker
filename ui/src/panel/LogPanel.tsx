import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import classnames from 'classnames';
import Button from '@material-ui/core/Button';

import { useStickyState } from '../utils';
import { ButtonGroup } from '@material-ui/core';

import ChatLog from './ChatLog';
import HandLog from './HandLog';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: 5,
            height: '100%',
            maxHeight: '100%',
            width: '15%',
            maxWidth: '350px',
            flexShrink: 0,
            ...theme.custom.LOGPANEL,
        },

        noDisplay: {
            display: 'none',
        },

        hideButtonGroup: {
            zIndex: 5,
            position: 'absolute',
            bottom: 'calc(15% + 25px)',
            right: 15,
        },
        hideButton: {
            borderColor: theme.custom.BACKGROUND_CONTRAST_COLOR,
            color: theme.custom.BACKGROUND_CONTRAST_COLOR,
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

const CHAT_HIDDEN_LOCAL_STORAGE_KEY = 'jp-hide-chat';
const HANDLOG_HIDDEN_LOCAL_STORAGE_KEY = 'jp-hide-handlog';

function LogPanel(props: LogPanelProps) {
    const classes = useStyles();

    const { className } = props;

    const [hideChatLog, setHideChatLog] = useStickyState(false, CHAT_HIDDEN_LOCAL_STORAGE_KEY);
    const [hideHandLog, setHideHandLog] = useStickyState(false, HANDLOG_HIDDEN_LOCAL_STORAGE_KEY);
    const [unreadChats, setUnreadChats] = useState(false);

    function renderMessagePanelButtons() {
        return (
            <ButtonGroup
                orientation="vertical"
                className={classnames(classes.hideButtonGroup)}
                style={hideHandLog && hideChatLog ? {} : { right: 'min(calc(15% + 15px), 365px)' }}
            >
                {renderHideHandLogButton()}
                {renderHideChatButton()}
            </ButtonGroup>
        );
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

    function renderHandLog() {
        return <HandLog hideChatLog={hideChatLog} hideHandLog={hideHandLog} />;
    }

    function renderChatLog() {
        return <ChatLog hideChatLog={hideChatLog} hideHandLog={hideHandLog} setUnreadChats={setUnreadChats} />;
    }

    function renderSharedLogPanel() {
        return (
            <>
                <div
                    className={classnames(classes.root, className)}
                    style={hideChatLog && hideHandLog ? { display: 'none' } : {}}
                >
                    {renderHandLog()}
                    {renderChatLog()}
                </div>
                {renderMessagePanelButtons()}
            </>
        );
    }

    return renderSharedLogPanel();
}

export default LogPanel;
