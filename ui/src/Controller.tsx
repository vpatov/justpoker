import React, { useState, Fragment } from "react";
import classnames from "classnames";
import { WsServer } from "./api/ws";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { Controller } from "./shared/models/uiState";
import { ActionType, ClientWsMessageRequest } from "./shared/models/wsaction";

import ButtonWithKeyPress from "./ButtonWithKeyPress";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
            height: "15%",
            position: "absolute",
            right: 0,
            bottom: 0,
            zIndex: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            ...theme.custom.CONTROLLER,
        },
        sizeAndBetActionsCont: {
            width: "50vmin",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
        },
        betActionsCont: {
            height: "100%",
            width: "30%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexWrap: "wrap",
            flexDirection: "column",
        },
        bettingCont: {
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
        adminButtonCont: {
            float: "right",
            height: "100%",
            width: "30%",
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
        betButton: {
            height: "100%",
            marginRight: "1.4vmin",
        },
        button: {
            width: "9vmin",
            fontSize: "1.4vmin",
        },
        incButton: {
            padding: 0,
            fontSize: "2vmin",
            fontWeight: "bold"
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
        ...theme.custom.ACTION_BUTTONS,
    })
);

export interface ControllerProps {
    controller: Controller;
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
    const classes = useStyles();
    const { className } = props
    const {
        toAct,
        unsetCheckCall,
        min,
        max,
        sizingButtons,
        actionButtons,
        adminButtons,

    } = props.controller;

    const [chipAmt, setChipAmt] = useState(0);
    const [betAmt, setBetAmt] = useState(0);

    const changeBetAmount = (newAmt) => {
        // parse string into int
        let intValue = parseInt(newAmt, 10);

        // if user tries to input non interger values set to current value
        if (Number.isNaN(intValue) || newAmt <= 0) {
            setBetAmt(0);
        } else {
            setBetAmt(Math.min(Math.floor(newAmt), max));
        }
        return
    };

    // TODO Redesign ClientWsMessageRequest type to better use typescripts features to better
    // represent the "one-of" idea
    function onClickActionButton(action) {
        WsServer.send({
            actionType: action,
            request: {
                type: action,
                amount: Number(betAmt),
            } as ClientWsMessageRequest,
        });
    }

    function onClickAdminButton(action) {
        WsServer.send({
            actionType: action,
            request: (action === ActionType.ADDCHIPS
                ? { chipAmount: chipAmt }
                : {}) as ClientWsMessageRequest,
        });
    }

    return (
        <div className={classnames(classes.root, className)}>
            <div className={classes.sizeAndBetActionsCont}>
                <div className={classes.betActionsCont}>
                    {actionButtons.map((button) => {
                        if (button.action !== ActionType.BET) {
                            return (
                                <ButtonWithKeyPress
                                    keyPress={`Key${KEY_ACTION_MAP[button.action]}`}
                                    className={classnames(
                                        classes.button,
                                        classes[button.action]
                                    )}
                                    onClick={() =>
                                        onClickActionButton(button.action)
                                    }
                                    disabled={!toAct}
                                >
                                    {`${button.label} (${
                                        KEY_ACTION_MAP[button.action]
                                        })`}
                                </ButtonWithKeyPress>
                            );
                        }
                    })}
                </div>
                <div className={classes.bettingCont}>
                    {sizingButtons.length > 0 ? (
                        <Fragment>
                            <div className={classes.betFieldButtonCont}>
                                <ButtonWithKeyPress
                                    keyPress={`Key${KEY_ACTION_MAP["BET"]}`}
                                    className={classnames(
                                        classes.button,
                                        classes.betButton,
                                        classes["BET"]
                                    )}
                                    onClick={() => onClickActionButton("BET")}
                                    disabled={!toAct}
                                >
                                    {`${"BET"} (${KEY_ACTION_MAP["BET"]})`}
                                </ButtonWithKeyPress>
                                <TextField
                                    className={classes.betTextField}
                                    InputProps={{
                                        classes: {
                                            input: classes.betTextFieldInput,
                                        },
                                    }}
                                    onChange={(event) =>
                                        changeBetAmount(event.target.value)
                                    }
                                    value={betAmt === 0 ? "" : betAmt}
                                    type="number"
                                    variant="outlined"
                                    autoFocus={true}
                                />
                                <div className={classes.incrementCont}>
                                    <ButtonWithKeyPress
                                        keyPress={"Minus"}
                                        onClick={() => changeBetAmount(betAmt - min)}
                                        className={classnames(
                                            classes.incButton,
                                            classes.incButtonLeft,
                                        )}

                                    >
                                        -
                                </ButtonWithKeyPress>
                                    <ButtonWithKeyPress
                                        keyPress={"Equal"}
                                        onClick={() => changeBetAmount(betAmt + min)}
                                        className={classnames(
                                            classes.incButton,
                                        )}
                                    >
                                        +
                                </ButtonWithKeyPress>
                                </div>
                            </div>
                            <div className={classes.sizingButtonsCont}>
                                {sizingButtons.map((button) => (
                                    <Button
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
                {(adminButtons || []).map((button) => (
                    <ButtonWithKeyPress
                        className={classnames(
                            classes.adminButton,
                            classes[button.action]
                        )}
                        onClick={(e) => onClickAdminButton(button.action)}
                    >
                        {`${button.label}`}
                    </ButtonWithKeyPress>
                ))}

                {(adminButtons || []).filter(
                    (button) => button.action === ActionType.ADDCHIPS
                ).length > 0 ? (
                        <TextField
                            onChange={(event) =>
                                setChipAmt(parseInt(event.target.value))
                            }
                            value={chipAmt === 0 ? "" : chipAmt}
                            type="number"
                            variant="outlined"
                        />
                    ) : null}
            </div>
        </div>
    );
}

export default ControllerComp;
