import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CardSmall from './CardSmall';
import classnames from 'classnames';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
    },
    folded: {
        opacity: 0,
        transition: 'opacity 0.1s ease-in-out',
    },
    heroHover: {
        '&:hover': {
            opacity: 1,
        },
    },
}));

function Hand(props) {
    const classes = useStyles();
    const { folded, hand, hero } = props;
    const { cards } = hand;

    return (
        <div
            className={classnames(
                classes.root,
                //{ [classes.folded]: folded, [classes.heroHover]: hero }
            )}
        >
            {cards.map((c, i) => (
                <CardSmall {...c} size="small" className={`ani_playerCard_${i}`} shouldFlex={cards.length > 2} />
            ))}
        </div>
    );
}

export default Hand;
