import React, { useState } from "react";
import classnames from "classnames";
import Hand from "./Hand";
import PlayerStack from "./PlayerStack";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import deepOrange from "@material-ui/core/colors/deepOrange";
import PlayerTimer from "./PlayerTimer";
import PlayerMenu from "./PlayerMenu";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "16vmin",
        height: "15vmin",
        transition: "transform 0.3s linear 0s",
        alignItems: "flex-end",
        display: "flex",
        flexWrap: "wrap",
    },
    folded: {
        ...theme.custom.FOLDED,
    },
    handLabel: {
        zIndex: 1,
        backgroundColor: deepOrange[400],
        fontSize: "1.2vmin",
        padding: "1% 8%",
        borderTop: `none`,
        borderBottomLeftRadius: "0.6vmin",
        borderBottomRightRadius: "0.5vmin",
    },
}));

function Player(props) {
    const classes = useStyles();
    const { className, style } = props;
    const {
        stack,
        hand,
        name,
        toAct,
        playerTimer,
        winner,
        button,
        folded,
        uuid,
    } = props.player;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        console.log(event.currentTarget);
        setAnchorEl(event.currentTarget as any);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.folded]: folded,
            })}
            style={style}
            onContextMenu={handleClick}
        >
            <PlayerMenu
                handleClose={handleClose}
                anchorEl={anchorEl}
                uuid={uuid}
                name={name}
                stack={stack}
            />
            <Hand hand={hand} />
            <PlayerStack
                toAct={toAct}
                name={name}
                stack={stack}
                button={button}
                winner={winner}
            />
            <div>
                {playerTimer ? <PlayerTimer playerTimer={playerTimer} /> : null}
            </div>
        </div>
    );
}

export default Player;
