import React from 'react';
import { generateStringFromRank, SUITS } from './utils';
import classnames from 'classnames';

import { WsServer } from './api/ws';
import {
    ClientActionType,
    UiActionType,
    ClientWsMessageRequest,
    ShowCardRequest,
} from './shared/models/dataCommunication';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';

import { ShowCardButton } from './shared/models/uiState';
import { Button, ButtonGroup, Tooltip } from '@material-ui/core';
import Suit from './Suit';
import { Card } from './shared/models/cards';
import { grey } from '@material-ui/core/colors';
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            minWidth: '4vw',
            position: 'relative',
        },
        showButton: {
            fontSize: '1.1vmin',
            width: '100%',
            margin: '0.5vmin',
        },
        button: {
            fontSize: '1vmin',
            padding: '0.4vmin',
        },
        suit: {
            width: '1vmin',
            height: '1vmin',
        },
        groupCont: {
            width: '100%',
        },
        group: {
            width: '100%',
            position: 'absolute',
            backgroundColor: grey[900],
            boxShadow: theme.shadows[24],
            transform: 'translateY(-20%)',
        },
        label: {
            fontSize: '1vmin',
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
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
            {open ? (
                // <Paper className={classes.groupCont}>
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
                                All
                            </Button>,
                        )}
                </ButtonGroup>
            ) : (
                // </Paper>
                <Button className={classes.showButton} onMouseEnter={handleOpen} variant="outlined">
                    Show
                </Button>
            )}
        </div>
    );
}

export default ControllerShowCard;
