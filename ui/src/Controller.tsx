import React, { useState, useEffect, Fragment } from "react";
import classnames from "classnames";
import { WsServer } from "./api/ws";
import { useSelector } from "react-redux";
import { controllerSelector, heroHandLabelSelector } from "./store/selectors";
import TextFieldWrap from "./reuseable/TextFieldWrap"

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { ActionType, ClientWsMessageRequest } from "./shared/models/wsaction";
import { Typography } from "@material-ui/core";
import { flipTable } from "./AnimiationModule";
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: "absolute",
            right: 0,
            bottom: 0,
            zIndex: 2,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            ...theme.custom.CONTROLLER,
        },
        rootToAct: {
            ...theme.custom.CONTROLLER_TO_ACT,
        },
        gameInfoCont: {
            marginLeft: "2vw",
            width: "20%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
        },
        sizeAndBetActionsCont: {
            width: "50%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
        },
        adminButtonCont: {
            marginLeft: "2vw",
            width: "30%",
            float: "right",
            height: "100%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
        },
        betActionsCont: {
            marginRight: "2vw",
            height: "100%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
        },
        bettingCont: {
            marginRight: "2vmin",
            height: "100%",
            width: "80%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexWrap: "wrap",
            flexDirection: "column",
        },
        sizingButtonsCont: {
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
        },
        betInput: {
            paddingRight: 50,
            paddingTop: 25,
        },
        amounts: {
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
        },
        betFieldButtonCont: {
            width: "100%",
            display: "flex",
        },
        betTextField: {
            flexGrow: 1,
            width: "5vmin",
            marginRight: "1vmin",
        },
        betTextFieldInput: {
            fontSize: "1.4vmin",
            padding: "1vmin",
        },
        button: {
            height: "40%",
            width: "10vmin",
            fontSize: "1.4vmin",
            marginRight: "0.8vmin",
        },
        incButton: {
            padding: 0,
            fontSize: "2vmin",
            fontWeight: "bold",
        },
        incButtonLeft: {
            marginRight: "1vmin",
        },
        adminButton: {
            fontSize: "1.4vmin",
        },
        sizeButton: {
            margin: 6,
            fontSize: "1vmin",
        },
        handLabel: {
            marginTop: "2vmin",
            fontSize: "2vmin",
            color: theme.palette.secondary.main,
        },
        toActLabel: {
            fontSize: "2vmin",
            color: theme.palette.primary.main,
            animation: "$blinking 1.3s linear infinite;",
        },
        "@keyframes blinking": {
            "50%": {
                opacity: 0,
            },
        },
        ...theme.custom.ACTION_BUTTONS,
    })
);

export interface ControllerProps {
    className?: string;
}

// conflicting with chat
// TODO either get rid of hotkeys and ensure
// chat isnt in focus..
const KEY_ACTION_MAP = {
    [ActionType.BET]: "B",
    [ActionType.CHECK]: "K",
    [ActionType.CALL]: "A",
    [ActionType.FOLD]: "F",
};

function ControllerComp(props: ControllerProps) {
    console.log("render controller");

    const classes = useStyles();
    const { className } = props;
    const {
        toAct,
        unsetQueuedAction,
        min,
        max,
        sizingButtons,
        actionButtons,
        adminButtons,
    } = useSelector(controllerSelector);

    const heroHandLabel = useSelector(heroHandLabelSelector);

    const [chipAmt, setChipAmt] = useState(0);
    const [betAmt, setBetAmt] = useState(0);

    const [queued, setQueued] = useState("");

    const changeBetAmount = (newAmt) => {
        // parse string into int
        let intValue = parseInt(newAmt, 10);

        // if user tries to input non interger values set to current value
        if (Number.isNaN(intValue) || newAmt <= 0) {
            setBetAmt(0);
        } else {
            setBetAmt(Math.min(Math.floor(newAmt), max));
        }
        return;
    };

    function onClickActionButton(action) {
        if (toAct) {
            sendServerAction(action);
        } else {
            if (queued === action) {
                setQueued("");
            } else {
                setQueued(action);
            }
        }
    }
    if (toAct && queued !== "") {
        sendServerAction(queued);
        setQueued("");
    }

    function sendServerAction(action) {
        WsServer.send({
            actionType: action,
            request: {
                type: action,
                amount: Number(betAmt),
            } as ClientWsMessageRequest,
        });
        if (action === ActionType.BET) {
            changeBetAmount(0);
        }
    }

    function onClickAdminButton(action) {
        WsServer.send({
            actionType: action,
            request: {} as ClientWsMessageRequest,
        });
    }

    function isBetValid() {
        if (0 < betAmt && betAmt < min) return true;
        return false;
    }

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.rootToAct]: toAct,
            })}
        >
            <div className={classes.gameInfoCont}>
                <Typography className={classes.handLabel}>
                    {heroHandLabel}
                </Typography>
                {toAct ? (
                    <Typography className={classes.toActLabel}>
                        {"☉ Your Turn"}
                    </Typography>
                ) : null}
            </div>
            <div className={classes.sizeAndBetActionsCont}>
                <div className={classes.betActionsCont}>
                    {actionButtons.map((button) => {
                        return (
                            <Button
                                variant="outlined"
                                className={classnames(
                                    classes.button,
                                    classes[button.action],
                                    {
                                        [classes[`${button.action}_QUEUED`]]:
                                            button.action === queued,
                                    }
                                )}
                                disabled={button.disabled}
                                onClick={() =>
                                    onClickActionButton(button.action)
                                }
                            >
                                {button.label}
                            </Button>
                        );
                    })}
                </div>
                <div className={classes.bettingCont}>
                    {sizingButtons.length > 0 ? (
                        <Fragment>
                            <div className={classes.betFieldButtonCont}>
                                <TextFieldWrap
                                    className={classes.betTextField}
                                    InputProps={{
                                        classes: {
                                            input: classes.betTextFieldInput,
                                        },
                                    }}
                                    onChange={(event) =>
                                        setBetAmt(event.target.value)
                                    }
                                    min={0}
                                    max={max}
                                    value={betAmt}
                                    type="number"
                                    autoFocus={true}
                                    error={isBetValid()}
                                    helperText={
                                        isBetValid()
                                            ? `Minimum Bet is ${min}`
                                            : ""
                                    }
                                />
                                <div className={classes.incrementCont}>
                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            changeBetAmount(betAmt - min)
                                        }
                                        className={classnames(
                                            classes.incButton,
                                            classes.incButtonLeft
                                        )}
                                    >
                                        -
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            changeBetAmount(betAmt + min)
                                        }
                                        className={classnames(
                                            classes.incButton
                                        )}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                            <div className={classes.sizingButtonsCont}>
                                {sizingButtons.map((button) => (
                                    <Button
                                        variant="outlined"
                                        className={classes.sizeButton}
                                        onClick={(e) =>
                                            changeBetAmount(button.value)
                                        }
                                    >
                                        {button.label}
                                    </Button>
                                ))}
                            </div>
                        </Fragment>
                    ) : null}
                </div>
            </div>
            <div className={classes.adminButtonCont}>
                <Button variant="outlined" onClick={() => flipTable()}>
                    Flip Table
                </Button>
                {(adminButtons || []).map((button) => (
                    <Button
                        variant="outlined"
                        className={classnames(
                            classes.adminButton,
                            classes[button.action]
                        )}
                        onClick={(e) => onClickAdminButton(button.action)}
                    >
                        {button.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default ControllerComp;
