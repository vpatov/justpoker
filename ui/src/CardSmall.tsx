import React from 'react';

import { generateStringFromSuit, SUITS } from './utils';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    root: {
        zIndex: -1,
        borderRadius: 6,
        textAlign: 'center',
        position: 'relative',
        backgroundColor: 'white',
        height: '7vmin',
        width: '6vmin',
        display: 'flex',
        justifyContent: 'space-evenly',
        margin: '0 0.5vmin',
    },
    flexCard: {
        width: 'unset',
        flex: '6vmin 1 1',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    text: {
        fontSize: '2.6vmin',
        fontWeight: 'bold',
        marginTop: '12%',
    },
    flexText: {
        marginTop: '0',
        fontSize: '2.4vmin',
        width: '100%',
    },
    flexTextSuit: {
        marginTop: '-40%',
        fontSize: '2vmin',
    },
    hidden: {
        ...theme.custom.HIDDEN,
    },
    hiddenText: {
        marginTop: '12%',
        fontWeight: 'bold',
        fontSize: '3vmin',
        color: theme.palette.primary.light,
    },
    flexTextHidden: {
        marginTop: '50%',
        fontSize: '2vmin',
    },
    partOfWinningHand: {
        transition: 'all 0.5s ease-in-out',
        ...theme.custom.WINNING_CARD,
    },
    [SUITS.HEARTS]: {
        ...theme.custom.HEARTS,
    },
    [SUITS.SPADES]: {
        ...theme.custom.SPADES,
    },
    [SUITS.CLUBS]: {
        ...theme.custom.CLUBS,
    },
    [SUITS.DIAMONDS]: {
        ...theme.custom.DIAMONDS,
    },
}));

function CardSmall(props) {
    const classes = useStyles();
    const { suit, rank, hidden, className, partOfWinningHand, shouldFlex } = props;

    if (hidden) {
        return (
            <div className={classnames(classes.root, classes.hidden, { [classes.flexCard]: shouldFlex }, className)}>
                <Typography className={classnames(classes.hiddenText, { [classes.flexTextHidden]: shouldFlex })}>
                    JP
                </Typography>
            </div>
        );
    }
    return (
        <div
            className={classnames(classes.root, classes[suit], className, {
                [classes.partOfWinningHand]: partOfWinningHand,
                [classes.flexCard]: shouldFlex,
            })}
        >
            <Typography className={classnames(classes.text, { [classes.flexText]: shouldFlex })}>{rank}</Typography>
            <Typography className={classnames(classes.text, { [classes.flexTextSuit]: shouldFlex })}>
                {generateStringFromSuit(suit)}
            </Typography>
        </div>
    );
}

export default CardSmall;
