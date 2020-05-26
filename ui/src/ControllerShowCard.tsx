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
import { Button, ButtonGroup } from '@material-ui/core';
import Suit from './Suit';
import { Card } from './shared/models/cards';
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '7vw',
            margin: '0.5vmin',
            position: 'relative',
        },
        showButton: {
            position: 'absolute',
            bottom: 0,
            fontSize: '1.1vmin',
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
            top: '50%',
            left: '50%',
            transform: ' translate(-50%, -50%)',
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
                <Button className={classes.showButton} onClick={handleOpen} variant="outlined">
                    Show Cards
                </Button>
            )}
        </div>
    );
}

export default ControllerShowCard;
