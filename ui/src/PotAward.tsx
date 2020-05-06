import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import Bet from './Bet';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { animateAwardPot } from './AnimiationModule';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: 5,
            margin: '2vmin',
        },
    }),
);

function PotAward(props) {
    const classes = useStyles();
    const { index, awardPot } = props;
    const { winnerUUID, value } = awardPot;
    const [lastAni, setLastAni] = useState(false as any);
    const potId = `ani_awardPot_${index}`;
    useEffect(() => {
        console.log('awp called effect', awardPot, index, lastAni);
        if (lastAni) {
            lastAni.reset();
        }
        const curAni = animateAwardPot(winnerUUID, potId);
        setLastAni(curAni);
    }, [awardPot]);

    return <Bet className={classnames(classes.root)} amount={value} id={potId} />;
}

export default PotAward;
