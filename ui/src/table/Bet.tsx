import React, { Fragment } from 'react';
import get from 'lodash/get';
import classnames from 'classnames';
import ChipStack from './ChipStack';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        zIndex: 5,
    },
    amount: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '2vmin',
        textShadow: `0.16vmin 0.13vmin black`,
        marginTop: '0.1vmin',
    },
}));

function Bet(props) {
    const classes = useStyles();
    const { className, style, amount, id } = props;

    return (
        <div
            id={id}
            className={classnames(classes.root, className, 'ani_bet')}
            style={{
                ...style,
            }}
        >
            <ChipStack amount={amount} />
            <Typography variant={'h6'} className={classnames(classes.amount, 'ani_betLabel')}>
                {amount.toLocaleString()}
            </Typography>
        </div>
    );
}

export default Bet;
