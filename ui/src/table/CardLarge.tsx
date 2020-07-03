import React, { useEffect, useContext } from 'react';
import { usePrevious } from '../utils';
import { animateWinningCards, animateDealCommunityCard } from '../game/AnimiationModule';
import { generateStringFromRank } from '../utils';
import classnames from 'classnames';
import SuitComponent from '../reuseable/Suit';
import {Suit} from '../shared/models/game/cards';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ASPECT_RATIO_BREAK_POINT } from '../style/Theme';
import { ThemeSetter } from '../root/App';
import { useColoredCardBackgroundStyles, useWhiteCardBackgroundStyles } from '../style/colors';

const CARD_HEIGHT = 11;
const CARD_WIDTH = 8.6;
const BORDER_SIZE = 0.22;
const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: 6,
        display: 'inline-block',
        textAlign: 'center',
        position: 'relative',
        height: `${CARD_HEIGHT}vmin`,
        width: `${CARD_WIDTH}vmin`,
        margin: '0.5vmin',
        overflow: 'hidden',
        transform: 'translateY(0)',
        transition: 'transform 0.5s ease-in-out',
        flex: 'none',
        boxShadow: theme.shadows[4],
        border: `${BORDER_SIZE}vmin solid transparent`,
        boxSizing: 'border-box',
    },
    placeholder: {
        backgroundColor: 'transparent',
        border: `${BORDER_SIZE}vmin solid rgba(255,255,255,0.6)`,
        boxShadow: 'none',
        height: `${CARD_HEIGHT - BORDER_SIZE}vmin`,
        width: `${CARD_WIDTH - BORDER_SIZE}vmin`,
    },
    text: {
        letterSpacing: '-0.5vmin',
        fontWeight: 'bold',
    },
    rank: {
        fontSize: '4.8vmin',
        lineHeight: '1em',
        position: 'absolute',
        top: '5%',
        left: '10%',
    },
    suit: {
        width: '4.8vmin',
        height: '4.8vmin',
        position: 'absolute',
        bottom: '5%',
        right: '5%',
    },

    smallWidth: {
        height: `${CARD_HEIGHT * 0.8}vmin`,
        width: `${CARD_WIDTH * 0.8}vmin`,
        '& > *': {
            fontSize: '4vmin',
            width: '4vmin',
            height: '4vmin',
        },
    },
    partOfWinningHand: {
        transform: 'translateY(33%)',
        zIndex: 1,
        ...theme.custom.WINNING_CARD,
    },
}));


function CardLarge(props) {
    const classes = useStyles();
    const coloredCardBackgroundClasses = useColoredCardBackgroundStyles();
    const whiteCardBackgroundClasses = useWhiteCardBackgroundStyles();
    const { suit, rank, partOfWinningHand, className, placeHolder } = props;
    const smallWidth = useMediaQuery(ASPECT_RATIO_BREAK_POINT);
    const { curPrefs } = useContext(ThemeSetter);

    function getCardBackGroundClasses(suit: Suit){
        const cardClasses = curPrefs.coloredCardBackground ? 
            coloredCardBackgroundClasses : 
            whiteCardBackgroundClasses;
        return [cardClasses.base, cardClasses[suit]];
    }


    const id = `${suit}${rank}`;
    // this function could be located in many different componets
    // we could also do it at a global level, maybe the animation module is peforming these diff?
    // or we could do it explictly as part of the backend animation flow
    const prevWinner = usePrevious(partOfWinningHand);
    useEffect(() => {
        if (!prevWinner && partOfWinningHand) {
            animateWinningCards();
        }
    }, [prevWinner, partOfWinningHand]);

    useEffect(() => {
        animateDealCommunityCard(id);
    }, []);

    if (placeHolder) {
        return (
            <div>
                <div
                    className={classnames(classes.root, classes.placeholder, {
                        [classes.smallWidth]: smallWidth,
                    })}
                />
            </div>
        );
    }

    return (
        <div id={id}>
            <div
                className={classnames(
                    classes.root, 
                    className, 
                    ...getCardBackGroundClasses(suit), 
                    {
                        [classes.partOfWinningHand]: partOfWinningHand,
                        ani_notWinningCard: !partOfWinningHand,
                        [classes.smallWidth]: smallWidth,
                    }
                )}
            >
                <Typography
                    className={classnames(classes.text, classes.rank)}
                    style={rank === 'T' ? { marginLeft: '-0.5vmin' } : {}}
                >
                    {generateStringFromRank(rank)}
                </Typography>
                <SuitComponent
                    suit={suit}
                    className={classes.suit}
                    color={!curPrefs.coloredCardBackground}
                />
            </div>
        </div>
    );
}

export default CardLarge;
