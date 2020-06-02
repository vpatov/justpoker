import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { WsServer } from './api/ws';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import Avatar from './Avatar';
import { grey } from '@material-ui/core/colors';
import { getPlayerAvatarBackground } from './style/colors';
import Animoji from './Animoji';
import { AnimationState, AnimationType } from './shared/models/animationState';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: 'rgba(255,255,255,1)',
            boxShadow: theme.shadows[4],
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            border: `0.25vmin solid ${grey[900]}`,
            overflow: 'hidden',
        },
        avatar: {
            width: `75%`,
            height: `75%`,
        },
        animoji: {
            width: `85%`,
            height: `85%`,
        },
    }),
);

const REACTION_TIME = 4000;

function PlayerAvatar(props) {
    const classes = useStyles();
    const { className, position, playerUUID } = props;
    const [showReaction, showReactionSet] = useState(false);
    const [reaction, reactionSet] = useState();
    const [timer, timerSet] = useState(0);

    useEffect(() => {
        WsServer.subscribe('animation', onReceiveNewAnimationState);
        return () => clearTimeout(timer);
    }, []);

    const onReceiveNewAnimationState = (animationState: AnimationState) => {
        if (animationState.animationType === AnimationType.REACTION && animationState.target === playerUUID) {
            showReactionSet(true);
            reactionSet(animationState.trigger as any);
        }
    };

    // set and clear timeouts
    useEffect(() => {
        if (showReaction) {
            clearTimeout(timer);
            const newTimer = setTimeout(() => {
                console.log('timout');
                showReactionSet(false);
            }, REACTION_TIME);
            timerSet(newTimer as any);
        }
    }, [showReaction, reaction]);

    const background = getPlayerAvatarBackground(position);
    return (
        <div className={classnames(classes.root, className)} style={{ background: background }}>
            {showReaction ? (
                <Animoji reaction={reaction} className={classes.animoji} />
            ) : (
                <Avatar className={classes.avatar} playerUUID={playerUUID} />
            )}
        </div>
    );
}

export default PlayerAvatar;
