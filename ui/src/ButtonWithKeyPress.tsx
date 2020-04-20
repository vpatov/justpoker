import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import classnames from "classnames";

const useStyles = makeStyles((theme: Theme) => {
    const activeStyles = {
        border: `3px solid ${theme.palette.primary.main}`,
        transition: "",
        "&:before": {
            position: "absolute",
            content: '""',
            width: "100%",
            height: "100%",
            zIndex: -1,
            backgroundColor: theme.palette.primary.light,
            "-webkit-animation": "$scale 0.1s 1 ease-in-out",
            animation: "$scale 0.1s 1 ease-in-out",
            opacity: 0.3,
        },
    };
    return createStyles({
        button: {
            overflow: "hidden",
            border: `3px solid transparent`,

            "&:hover": {
                ...activeStyles,
            },
        },
        active: {
            ...activeStyles,
        },
        "@keyframes scale": {
            "0%": {
                opacity: 0,
            },
            "100%": {
                opacity: 0.3,
            },
        },
    });
});

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
