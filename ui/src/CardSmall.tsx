import React from 'react';

import { generateStringFromSuit, generateStringFromRank, SUITS } from './utils';
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
        margin: '0 -1.5vmin',
        boxShadow: '-0.2vmin 0px 0.8vmin 0px rgba(0,0,0,0.75)',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
    },
    text: {
        letterSpacing: '-0.2vmin',
        fontSize: '2.4vmin',
        fontWeight: 'bold',
        marginTop: '12%',
    },
    flexText: {
        marginTop: '0.2vmin',
        marginLeft: '0.5vmin',
        width: '100%',
        textAlign: 'left',
        fontSize: '1.9vmin',
    },
    flexTextSuit: {
        marginLeft: '0.4vmin',
        margin: '0',
        width: '100%',
        textAlign: 'left',
        fontSize: '1.7vmin',
    },
    hidden: {
        ...theme.custom.HIDDEN,
    },
    hiddenText: {
        marginTop: '12%',
        fontWeight: 'bold',
        fontSize: '3vmin',
        color: theme.palette.primary.light,
        textShadow: `0.16vmin 0.13vmin ${theme.palette.primary.main}`,
    },
    flexTextHidden: {
        marginLeft: '25%',
        fontSize: '3vmin',
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
            <Typography
                className={classnames(classes.text, { [classes.flexText]: shouldFlex })}
                style={rank === 'T' ? { marginLeft: '-0.3%' } : {}}
            >
                {generateStringFromRank(rank)}
            </Typography>
            <Typography className={classnames(classes.text, { [classes.flexTextSuit]: shouldFlex })}>
                {generateStringFromSuit(suit)}
            </Typography>
        </div>
    );
}

export default CardSmall;
