import React, { useEffect, useContext } from 'react';
import { usePrevious } from '../utils';
import { flipCard, unflipCard } from '../game/AnimiationModule';
import { useSelector } from 'react-redux';
import { selectCanShowHideCards } from '../store/selectors';
import { generateStringFromRank } from '../utils';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import SuitComponent from '../reuseable/Suit';
import { Suit, Card } from '../shared/models/game/cards';
import { grey } from '@material-ui/core/colors';
import { ThemeSetter } from '../root/App';
import { useColoredCardBackgroundStyles, useWhiteCardBackgroundStyles } from '../style/colors';
import { WsServer } from '../api/ws';
import { Button } from '@material-ui/core';

const NORMAL_CARD_SIZE = '3.4vmin';
const SIZE_CARD_SIZE = '2.5vmin';

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: 6,
        textAlign: 'center',
        position: 'relative',
        height: '8.8vmin',
        width: '6.7vmin',
        display: 'flex',
        justifyContent: 'space-evenly',
        margin: '0 0.5vmin',
        boxShadow: '0vmin 0px 0.5vmin 0vmin rgba(0,0,0,0.5)',
        '&:hover $showButton': {
            opacity: 1,
        },
    },
    flippable: {
        cursor: 'pointer',
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
    isBeingShown: {
        boxShadow: `0 0 0.3vmin 0.2vmin ${theme.palette.secondary.main}`,
    },
    partOfWinningHand: {
        transform: 'translateY(33%)',
        filter: 'brightness(1)',
    },
    notPartOfWinningHand: {
        transform: 'translateY(0%)',
        filter: 'brightness(0.2)',
    },
}));

function CardSmall(props) {
    const classes = useStyles();
    const {
        suit,
        rank,
        hidden,
        className,
        shouldFlex,
        partOfWinningHand,
        isBeingShown,
        hero,
        style,
        cannotHideCards,
    } = props;
    const cardId = `${suit}-${rank}`;
    const prevIsBeingShown = usePrevious(isBeingShown);
    const canShowHideCards = useSelector(selectCanShowHideCards);
    const coloredCardBackgroundClasses = useColoredCardBackgroundStyles();
    const whiteCardBackgroundClasses = useWhiteCardBackgroundStyles();
    const { curPrefs } = useContext(ThemeSetter);
    const isFlipable = hero && canShowHideCards && !(cannotHideCards && isBeingShown);

    function getCardBackGroundClasses(suit: Suit) {
        const cardClasses = curPrefs.coloredCardBackground ? coloredCardBackgroundClasses : whiteCardBackgroundClasses;
        return [cardClasses.base, cardClasses[suit]];
    }

    // animation
    useEffect(() => {
        if (canShowHideCards && prevIsBeingShown !== isBeingShown) {
            if (isBeingShown) {
                flipCard(cardId, hero);
            } else {
                unflipCard(cardId, hero);
            }
        }
    }, [isBeingShown, prevIsBeingShown, hero, canShowHideCards, cardId]);

    function showCard() {
        if (hero && canShowHideCards) {
            const cards: Card[] = [{ suit, rank }];
            if (isBeingShown) {
                if (!cannotHideCards) WsServer.sendHideCardMessage(cards);
            } else {
                WsServer.sendShowCardMessage(cards);
            }
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
        <div
            className={classnames(classes.root, ...getCardBackGroundClasses(suit), className, {
                [classes.partOfWinningHand]: partOfWinningHand,
                [classes.notPartOfWinningHand]: partOfWinningHand === false,
                [classes.sideCard]: shouldFlex,
                [classes.isBeingShown]: isBeingShown && hero,
                [classes.flippable]: isFlipable,
            })}
            id={cardId}
            style={style}
            onClick={showCard}
        >
            {isFlipable ? (
                <Button onClick={showCard} variant="contained" className={classes.showButton}>
                    {isBeingShown ? 'Hide' : 'Show'}
                </Button>
            ) : null}

            <Typography
                className={shouldFlex ? classes.sideRank : classes.rank}
                style={rank === 'T' ? { marginLeft: '-0.5%', left: '2%' } : {}}
            >
                {generateStringFromRank(rank)}
            </Typography>
            <SuitComponent
                suit={suit}
                className={shouldFlex ? classes.sideSuit : classes.suit}
                color={!curPrefs.coloredCardBackground}
            />
        </div>
    );

    return visibleCardComponent;
}

export default CardSmall;
