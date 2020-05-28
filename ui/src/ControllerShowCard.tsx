import React from 'react';
import { generateStringFromRank, SUITS } from './utils';
import classnames from 'classnames';

import { WsServer } from './api/ws';
import { ClientActionType, UiActionType, ClientWsMessageRequest, ShowCardRequest } from './shared/models/api';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';

import { ShowCardButton } from './shared/models/uiState';
import { Button, ButtonGroup, Tooltip } from '@material-ui/core';
import Suit from './Suit';
import { Card } from './shared/models/cards';
import { grey } from '@material-ui/core/colors';
import Grow from '@material-ui/core/Grow';
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            justifyContent: 'center',
        },

        showButton: {
            fontSize: '1.1vmin',
            margin: '0.5vmin',
            // transition: 'opacity 0.3s ease-in-out',
        },
        button: {
            fontSize: '1vmin',
            padding: '0.4vmin',
        },
        suit: {
            width: '1vmin',
            height: '1vmin',
        },
        group: {
            position: 'absolute',
            bottom: '-40%',
            zIndex: 6,
            backgroundColor: grey[900],
            boxShadow: theme.shadows[24],
        },
        hide: {
            opacity: 0,
        },
    }),
);

export interface ControllerShowCardProps {
    showCardButtons: ShowCardButton[];
    heroPlayerUUID: string;
    className?: string;
}

function ControllerShowCard(props: ControllerShowCardProps) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const { showCardButtons, heroPlayerUUID, className } = props;

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    function handleSingleClickButton(button: ShowCardButton) {
        sendShowCardRequest([{ suit: button.suit, rank: button.rank }]);
    }

    function handleShowAllButton() {
        sendShowCardRequest(showCardButtons.map((b) => ({ suit: b.suit, rank: b.rank })));
    }

    function sendShowCardRequest(cards: Card[]) {
        WsServer.send({
            actionType: ClientActionType.SHOWCARD,
            request: {
                playerUUID: heroPlayerUUID,
                cards: cards,
            } as ClientWsMessageRequest,
        });
    }
    return (
        <div className={classnames(classes.root, className)} onMouseLeave={handleClose}>
            <Grow in={open}>
                <ButtonGroup orientation="vertical" className={classes.group}>
                    {showCardButtons
                        .map((button) => (
                            <Button className={classes.button} onClick={() => handleSingleClickButton(button)}>
                                {generateStringFromRank(button.rank)}
                                <Suit className={classes.suit} suit={button.suit}></Suit>
                            </Button>
                        ))
                        .concat(
                            <Button onClick={() => handleShowAllButton()} className={classes.button}>
                                All Cards
                            </Button>,
                        )}
                </ButtonGroup>
            </Grow>

            <Button
                className={classnames(classes.showButton, { [classes.hide]: open })}
                variant="outlined"
                onMouseEnter={handleOpen}
            >
                Show Cards
            </Button>
        </div>
    );
}

export default ControllerShowCard;
