import React, { useEffect } from 'react';
import { usePrevious } from '../utils';
import { flipCard } from '../game/AnimiationModule';
import { generateStringFromRank, SUITS } from '../utils';
import { useSelector } from 'react-redux';
import { selectCanShowHideCards } from '../store/selectors';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Suit from '../reuseable/Suit';
import { Button } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { WsServer } from '../api/ws';
import { Card } from '../shared/models/game/cards';

const NORMAL_CARD_SIZE = '3.4vmin';
const SIZE_CARD_SIZE = '2.5vmin';

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: 6,
        textAlign: 'center',
        position: 'relative',
        backgroundColor: 'white',
        height: '8.8vmin',
        width: '6.7vmin',
        display: 'flex',
        justifyContent: 'space-evenly',
        margin: '0 0.5vmin',
        boxShadow: '0vmin 0px 0.5vmin 0vmin rgba(0,0,0,0.5)',
        cursor: 'pointer',
        '&:hover $showButton': {
            opacity: 1,
        },
        // '&:hover': {
        //     zIndex: 9,
        // },
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
        fontSize: NORMAL_CARD_SIZE,
        lineHeight: NORMAL_CARD_SIZE,
        fontWeight: 'bold',
        top: '6%',
        left: '10%',
    },
    suit: {
        position: 'absolute',
        width: NORMAL_CARD_SIZE,
        height: NORMAL_CARD_SIZE,
        top: '39%',
        right: '1%',
    },
    sideRank: {
        fontWeight: 'bold',
        marginTop: '0.2vmin',
        marginLeft: '0.5vmin',
        width: '100%',
        textAlign: 'left',
        fontSize: SIZE_CARD_SIZE,
    },
    sideSuit: {
        marginLeft: '0.4vmin',
        textAlign: 'left',
        width: SIZE_CARD_SIZE,
        height: SIZE_CARD_SIZE,
    },
    hidden: {
        backgroundColor: grey[900],
    },
    hiddenText: {
        marginTop: '20%',
        fontWeight: 'bold',
        fontSize: '3vmin',
        color: theme.palette.primary.light,
    },
    sideTextHidden: {
        marginLeft: '20%',
        fontSize: '3vmin',
    },
    showButton: {
        opacity: 0,
        padding: '0 0.3vmin',
        position: 'absolute',
        fontSize: '1.1vmin',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        width: '72%',
    },

    showOverlayText: {
        color: 'black',
        fontSize: '1.6vmin',
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
    const { suit, rank, hidden, className, shouldFlex, partOfWinningHand, isBeingShown, hero, style } = props;
    const cardId = `${suit}-${rank}`;
    const prevIsBeingShown = usePrevious(isBeingShown);
    const canShowHideCards = useSelector(selectCanShowHideCards);

    useEffect(() => {
        if (canShowHideCards && prevIsBeingShown !== isBeingShown) {
            flipCard(cardId, hero);
        }
    }, [isBeingShown, prevIsBeingShown]);

    function showCard() {
        if (hero && canShowHideCards) {
            const cards: Card[] = [{ suit, rank }];
            isBeingShown ? WsServer.sendHideCardMessage(cards) : WsServer.sendShowCardMessage(cards);
        }
    }

    if (hidden) {
        return (
            <div
                className={classnames(classes.root, classes.hidden, { [classes.sideCard]: shouldFlex }, className)}
                style={style}
            >
                <Typography className={classnames(classes.hiddenText, { [classes.sideTextHidden]: shouldFlex })}>
                    JP
                </Typography>
            </div>
        );
    }

    const visibleCardComponent = (
        <>
            <div
                className={classnames(classes.root, classes[suit], className, {
                    ani_notWinningCard: !partOfWinningHand,
                    [classes.sideCard]: shouldFlex,
                })}
                id={cardId}
                style={style}
                onClick={showCard}
            >
                {hero && canShowHideCards ? (
                    <Button
                        onClick={showCard}
                        variant="contained"
                        className={classes.showButton}
                        style={isBeingShown ? { opacity: 1 } : {}}
                    >
                        {isBeingShown ? 'Hide' : 'Show'}
                    </Button>
                ) : null}

                <Typography
                    className={shouldFlex ? classes.sideRank : classes.rank}
                    style={rank === 'T' ? { marginLeft: '-0.5%', left: '2%' } : {}}
                >
                    {generateStringFromRank(rank)}
                </Typography>
                <Suit suit={suit} className={shouldFlex ? classes.sideSuit : classes.suit} />
            </div>
        </>
    );

    return visibleCardComponent;
}

export default CardSmall;
