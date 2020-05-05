import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CardSmall from './CardSmall';
import classnames from 'classnames';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
    },
}));

function Hand(props) {
    const classes = useStyles();
    const { cards } = props.hand;

    return (
        <div className={classnames(classes.root)}>
            {cards.map((c, i) => (
                <CardSmall
                    suit={c.suit}
                    rank={c.rank}
                    hidden={c.hidden}
                    partOfWinningHand={c.partOfWinningHand}
                    size="small"
                    className={`ani_playerCard_${i}`}
                />
            ))}
        </div>
    );
}

export default Hand;
