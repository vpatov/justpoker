import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { WsServer } from '../api/ws';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import Avatar from '../reuseable/Avatar';
import Animoji from '../reuseable/Animoji';
import { AnimationState, AnimationType } from '../shared/models/state/animationState';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            marginLeft: '0.2vmin',
            marginRight: '0.5vmin',
            height: '100%',
            width: '6vmin',
        },
        avatar: {
            width: `90%`,
            height: `90%`,
            transform: 'translateY(5%)',
        },
        animoji: {
            width: `100%`,
            height: `100%`,
        },
    }),
);

const REACTION_TIME = 4000;

function PlayerAvatar(props) {
    const classes = useStyles();
    const { className, avatarKey, playerUUID } = props;
    const [reactionState, SET_reactionState] = useState({ show: false, reaction: '' });
    const [timer, timerSet] = useState(0);

    useEffect(() => {
        WsServer.subscribe('animation', onReceiveNewAnimationState);
        return () => clearTimeout(timer);
    }, []);

    const onReceiveNewAnimationState = (animationState: AnimationState) => {
        if (animationState.animationType === AnimationType.REACTION && animationState.target === playerUUID) {
            SET_reactionState({ show: true, reaction: animationState.trigger as any });
        }
    };

    // set and clear timeouts
    useEffect(() => {
        if (reactionState.show) {
            clearTimeout(timer);
            const newTimer = setTimeout(() => {
                SET_reactionState({ show: false, reaction: '' });
            }, REACTION_TIME);
            timerSet(newTimer as any);
        }
    }, [reactionState]);

    return (
        <div className={classnames(classes.root, className)}>
            {reactionState.show ? (
                <Animoji reaction={reactionState.reaction} className={classes.animoji} animated />
            ) : (
                <Avatar className={classes.avatar} avatarKey={avatarKey} />
            )}
        </div>
    );
}

export default PlayerAvatar;
