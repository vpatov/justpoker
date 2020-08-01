import React from 'react';
import classnames from 'classnames';
import ChipStack from './ChipStack';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { useChipFormatter } from '../game/ChipFormatter';

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
    const ChipFormatter = useChipFormatter();

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
                {ChipFormatter(amount)}
            </Typography>
        </div>
    );
}

export default Bet;
