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
    text: {
        letterSpacing: '-0.3vmin',
        fontSize: '2.6vmin',
        color: 'white',
        fontWeight: 'bold',
        marginTop: '12%',
    },
    // TODO change and make aesthetically pleasing. 
    partOfWinningHand: {
        boxShadow: "10px 10px 15px 15px #ffffdd"
    },
    hidden: {
        ...theme.custom.HIDDEN,
        overflow: 'hidden',
    },
    hiddenText: {
        fontWeight: 'bold',
        position: 'absolute',
        fontSize: '3.3vmin',
        color: theme.palette.primary.light,
    },
    hiddenText2: {
        fontWeight: 'bold',
        position: 'absolute',
        fontSize: '3.64vmin',
        color: theme.palette.primary.main,
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
    const { suit, rank, hidden, className, partOfWinningHand } = props;

    if (hidden) {
        return (
            <div className={classnames(classes.root, classes.hidden, className)}>
                <Typography className={classnames(classes.hiddenText2)}>JP</Typography>
                <Typography className={classnames(classes.hiddenText)}>JP</Typography>
            </div>
        );
    }
    return (
        <div className={classnames(classes.root, classes[suit], className, 
            {[classes.partOfWinningHand] : partOfWinningHand})}>
            <Typography className={classnames(classes.text)}>{`${rank} ${generateStringFromSuit(suit)}`}</Typography>
        </div>
    );
}

export default CardSmall;
