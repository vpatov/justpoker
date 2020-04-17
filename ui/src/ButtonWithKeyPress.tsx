import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import classnames from "classnames";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {},
        active: {
            sizing: "borderBox",
            border: "5px solid aqua",
            transition: "",
        },
        // ripple: {
        //     "&:before": {
        //         position: "absolute",
        //         content: '""',
        //         width: "50vmin",
        //         height: "50vmin",
        //         borderRadius: "50%",
        //         backgroundColor: `rgba(0,255,255,0.2)`,
        //         "-webkit-animation": "$scale 0.3s 1 ease-in-out",
        //         animation: "$scale 0.3s 1 ease-in-out",
        //     },
        // },
        // "@keyframes scale": {
        //     "0%": {
        //         transform: "scale(0)",
        //     },
        //     "100%": {
        //         transform: "scale(1)",
        //     },
        // },
    })
);

function ButtonWithKeyPress(props) {
    const classes = useStyles();
    const { className, keyPress, onClick, ...rest } = props;

    const [isKeyDown, setIsKeyDown] = useState(false);

    useEffect(() => {
        function keyDown(e) {
            if (e.code === `Key${keyPress}` && !isKeyDown) setIsKeyDown(true);
        }
        function keyUp(e) {
            if (e.code === `Key${keyPress}` && isKeyDown) {
                setIsKeyDown(false);
                onClick();
            }
        }
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);

        return () => {
            document.removeEventListener("keydown", keyDown);
            document.removeEventListener("keyup", keyUp);
        };
    });

    return (
        <Button
            {...rest}
            onClick={onClick}
            disableRipple
            className={classnames(className, classes.button, {
                [classes.active]: isKeyDown,
            })}
        />
    );
}
export default ButtonWithKeyPress;
