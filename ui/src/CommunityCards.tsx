import React from 'react';
import CardLarge from './CardLarge';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    communityCardsCont: {
        height: '25%',
        width: '65%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    communityCard: {},
}));
function CommunityCards(props) {
    const classes = useStyles();
    const { communityCards } = props;

    console.log(communityCards);

    return (
        <div className={classes.communityCardsCont}>
            {communityCards.map((c, i) => (
                <CardLarge 
                    suit={c.suit}
                    rank={c.rank}
                    fontSize={'2.5vmin'}
                    className={classes.communityCard}
                    partOfWinningHand={c.partOfWinningHand}
                />
            ))}
        </div>
    );
}

export default CommunityCards;
