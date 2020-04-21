import React, { useState, useEffect } from "react";
import get from "lodash/get";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import classnames from "classnames";

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        active: {
            ...get(theme, 'overrides.MuiButton.root["&:hover"]', {}),
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
            className={classnames(className, {
                [classes.active]: isKeyDown,
            })}
        />
    );
}
export default ButtonWithKeyPress;
