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
            justifyContent: "space-evenly",
            alignItems: "center",
            ...theme.custom.CONTROLLER,
        },
        sizeAndBetActionsCont: {
            width: "60%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
        },
        betActionsCont: {
            height: "100%",
            width: "50%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexWrap: "wrap",
        },
        bettingCont: {
            height: "100%",
            width: "60%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexWrap: "wrap",
        },
        sizingButtonsCont: {
            width: "100%",
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
        betTextField: {
            width: "80%",
            margin: "auto",
        },
        betTextFieldInput: {
            fontSize: "1.5vmin",
            padding: "1vmin",
        },
        button: {
            width: "40%",
            maxHeight: "72px",
            minHeight: "36px",
            backgroundColor: "white",
            fontSize: "1.4vmin",
        },
        adminButton: {
            fontSize: "1.4vmin",

            maxHeight: "72px",
            minHeight: "36px",
        },
        sizeButton: {
            margin: 6,
            backgroundColor: "white",
        },
        ...theme.custom.ACTION_BUTTONS,
    })
);

export interface ControllerProps {
    controller: Controller;
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
        setBetAmt(Math.min(Math.floor(newAmt), max));
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
        <div className={classes.root}>
            <div className={classes.sizeAndBetActionsCont}>
                <div className={classes.betActionsCont}>
                    {actionButtons.map((button) => (
                        <ButtonWithKeyPress
                            // keyPress={KEY_ACTION_MAP[button.action]}
                            variant="contained"
                            className={classnames(
                                classes.button,
                                classes[button.action]
                            )}
                            onClick={() => onClickActionButton(button.action)}
                            disabled={!toAct}
                        >
                            {`${button.label}`}
                        </ButtonWithKeyPress>
                    ))}
                </div>
                <div className={classes.bettingCont}>
                    {sizingButtons.length > 0 ? (
                        <Fragment>
                            <ButtonWithKeyPress
                                // keyPress={KEY_ACTION_MAP["BET"]}
                                variant="contained"
                                className={classnames(
                                    classes.button,
                                    classes["BET"]
                                )}
                                onClick={() => onClickActionButton("BET")}
                                disabled={!toAct}
                            >
                                {`${"BET"}`}
                            </ButtonWithKeyPress>
                            <TextField
                                className={classes.betTextField}
                                InputProps={{
                                    classes: {
                                        input: classes.betTextFieldInput,
                                    },
                                }}
                                onChange={(event) =>
                                    setBetAmt(parseInt(event.target.value))
                                }
                                value={betAmt === 0 ? "" : betAmt}
                                type="number"
                                variant="outlined"
                                autoFocus={true}
                            />
                            <div className={classes.sizingButtonsCont}>
                                {sizingButtons.map((button) => (
                                    <Button
                                        variant="contained"
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
                        variant="contained"
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
