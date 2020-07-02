import React from 'react';
import CardLarge from './CardLarge';
import classnames from 'classnames';
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
    const { communityCards, className } = props;

    function generatePlaceholders() {
        const placeHolders: any[] = [];
        for (let i = communityCards.length; i < 5; i++) {
            placeHolders.push(<CardLarge key={`${i}pl`} placeHolder />);
        }
        return placeHolders;
    }
    return (
        <div className={classnames(classes.communityCardsCont, className)}>
            {communityCards.map((c, i) => (
                <CardLarge {...c} key={i} />
            ))}
            {generatePlaceholders()}
        </div>
    );
}

export default CommunityCards;
