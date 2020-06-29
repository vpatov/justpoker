import React from 'react';
import CardLarge from './CardLarge';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    communityCardsCont: {
        height: '25%',
        width: '80%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));
function CommunityCards(props) {
    const classes = useStyles();
    const { communityCards } = props;

    function generatePlaceholders() {
        const placeHolders: any[] = [];
        for (let i = communityCards.length; i < 5; i++) {
            placeHolders.push(<CardLarge key={`${i}pl`} placeHolder />);
        }
        return placeHolders;
    }
    return (
        <div className={classes.communityCardsCont}>
            {communityCards.map((c, i) => (
                <CardLarge {...c} key={i} />
            ))}
            {generatePlaceholders()}
        </div>
    );
}

export default CommunityCards;
