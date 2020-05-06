import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Bet from './Bet';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import classnames from 'classnames';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'absolute',
            top: '0',
            width: '40%',
            height: '35%',
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'column',
            justifyContent: 'flex-end',
        },
        mainPotCont: {
            width: '100%',
            textAlign: 'center',
            marginBottom: '1vmin',
        },
        sidePotsCont: {
            display: 'flex',
            width: '100%',
            justifyContent: 'space-around',
        },
        awardPotCont: {
            position: 'absolute',
            top: '10%',
            zIndex: 5,
        },
        mainPot: {
            display: 'inline-block',
            fontSize: '2.3vmin',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '1vmin',
            padding: '0.8vmin 1.5vmin',
        },
        sidePot: {
            textAlign: 'center',
            fontSize: '1.9vmin',
        },
        awardPot: {
            zIndex: 5,
        },
        fullPot: {
            borderRadius: '0.5vmin',
            zIndex: 5,
            padding: '0.5vmin 0.8vmin',
            backgroundColor: 'rgba(0,0,0,0.3)',
            color: 'white',
            top: '-9%',
            position: 'absolute',
            fontSize: '1vmin',
        },
    }),
);

function TablePot(props) {
    const classes = useStyles();
    const { activePot, fullPot, inactivePots, awardPots } = props;
    const showInactivePots = inactivePots.length >= 1;
    const showActivePot = activePot !== 0;

    return (
        <>
            <Tooltip placement="top" title="Current main pot plus all commited bets by every player.">
                <Typography className={classes.fullPot}>{`Full Pot: ${fullPot.toLocaleString()}`}</Typography>
            </Tooltip>
            {awardPots ? (
                <div className={classes.awardPotCont}>
                    {awardPots.map((pot) => (
                        <Bet className={classnames(classes.awardPot, 'ani_awardPot')} amount={pot} />
                    ))}
                </div>
            ) : null}
            <div className={classnames(classes.root)}>
                {showActivePot ? (
                    <div className={classes.mainPotCont}>
                        <Typography
                            className={classnames(classes.mainPot)}
                        >{`${activePot.toLocaleString()}`}</Typography>
                    </div>
                ) : null}
                {showInactivePots ? (
                    <div className={classes.sidePotsCont}>
                        {inactivePots.map((sp) => (
                            <Typography className={classnames(classes.sidePot)}>{`${sp.toLocaleString()}`}</Typography>
                        ))}
                    </div>
                ) : null}
            </div>
        </>
    );
}

export default TablePot;
