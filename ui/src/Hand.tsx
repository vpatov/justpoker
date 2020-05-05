import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CardSmall from './CardSmall';
import classnames from 'classnames';

const useStyles = makeStyles((theme) => ({
    root: {
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
                <CardSmall {...c} size="small" className={`ani_playerCard_${i}`} shouldFlex={cards.length > 2} />
            ))}
        </div>
    );
}

export default Hand;
