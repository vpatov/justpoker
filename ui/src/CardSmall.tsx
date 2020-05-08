import React from 'react';

import { generateStringFromRank, SUITS } from './utils';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Suit from './Suit';

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
    sideCard: {
        margin: '0 -1.5vmin',
        boxShadow: '-0.2vmin 0px 0.8vmin 0px rgba(0,0,0,0.75)',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
    },
    rank: {
        letterSpacing: '-0.4vmin',

        position: 'absolute',
        fontSize: '2.8vmin',
        lineHeight: '2.8vmin',
        fontWeight: 'bold',
        top: '6%',
        left: '10%',
    },

    suit: {
        position: 'absolute',
        width: '2.8vmin',
        height: '2.8vmin',
        top: '42%',
        right: '3%',
    },

    sideRank: {
        fontWeight: 'bold',
        marginTop: '0.2vmin',
        marginLeft: '0.5vmin',
        width: '100%',
        textAlign: 'left',
        fontSize: '1.9vmin',
    },

    sideSuit: {
        marginLeft: '0.4vmin',
        textAlign: 'left',
        width: '1.7vmin',
        height: '1.7vmin',
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
    sideTextHidden: {
        marginLeft: '20%',
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
            <div className={classnames(classes.root, classes.hidden, { [classes.sideCard]: shouldFlex }, className)}>
                <Typography className={classnames(classes.hiddenText, { [classes.sideTextHidden]: shouldFlex })}>
                    JP
                </Typography>
            </div>
        );
    }
    return (
        <div
            className={classnames(classes.root, classes[suit], className, {
                [classes.partOfWinningHand]: partOfWinningHand,
                [classes.sideCard]: shouldFlex,
            })}
        >
            <Typography
                className={shouldFlex ? classes.sideRank : classes.rank}
                style={rank === 'T' ? { marginLeft: '-0.5%', left: '2%' } : {}}
            >
                {generateStringFromRank(rank)}
            </Typography>
            <Suit suit={suit} className={shouldFlex ? classes.sideSuit : classes.suit} />
        </div>
    );
}

export default CardSmall;
