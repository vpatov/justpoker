import React, { useEffect, useState } from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import Avatar from './Avatar';
import { grey } from '@material-ui/core/colors';
import { getPlayerAvatarBackground } from './style/colors';
import Animoji from './Animoji';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: 'rgba(255,255,255,1)',
            boxShadow: theme.shadows[4],
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            border: `0.3vmin solid ${grey[900]}`,
            overflow: 'hidden',
        },
    }),
);

const REACTION_TIME = 4000;

function PlayerAvatar(props) {
    const classes = useStyles();
    const { className, position, reaction } = props;
    const [showReaction, showReactionSet] = useState(reaction);

    useEffect(() => {
        if (reaction) {
            showReactionSet(reaction);
            setTimeout(() => showReactionSet(false), REACTION_TIME);
        }
    }, [reaction]);

    const background = getPlayerAvatarBackground(position);
    return (
        <div className={classnames(classes.root, className)} style={{ background: background }}>
            {showReaction ? <Animoji /> : <Avatar avatarKey={`a${position}`} />}
        </div>
    );
}

export default PlayerAvatar;
