import React, { Fragment } from 'react';
import get from 'lodash/get';
import classnames from 'classnames';
import ChipStack from './ChipStack';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    amount: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.8vmin',
        marginTop: '0.3vmin',
    },
}));

function Bet(props) {
    const classes = useStyles();
    const { className, style, amount } = props;

    return (
        <div
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
