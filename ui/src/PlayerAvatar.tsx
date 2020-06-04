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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

            overflow: 'hidden',
            marginLeft: '0.2vmin',
            marginRight: '0.5vmin',
            // flexShrink: 0,
            height: '100%',
            width: '6vmin',
            transform: 'translateY(5%)',
            // borderRadius: '50%',
            // boxShadow: theme.shadows[4],
            // border: `0.25vmin solid ${grey[900]}`,
            // background: `radial-gradient(${grey[100]} 0%, ${grey[400]})`,
        },
        avatar: {
            width: `90%`,
            height: `90%`,
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
    const { className, avatarKey, playerUUID } = props;
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

    // const background = getPlayerAvatarBackground(position);
    const background = `radial-gradient(${grey[800]} 0%, ${grey[900]})`;
    return (
        <div className={classnames(classes.root, className)}>
            {showReaction ? (
                <Animoji reaction={reaction} className={classes.animoji} />
            ) : (
                <Avatar className={classes.avatar} avatarKey={avatarKey} />
            )}
        </div>
    );
}

export default PlayerAvatar;
