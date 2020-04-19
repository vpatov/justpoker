import React, { useState } from "react";
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
            width: "18%",
            height: "100%",
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 2,
            ...theme.custom.CONTROLLER,
        },
        sizeAndBetActionsCont: {
            marginLeft: "auto",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
        },
        betActionsCont: {
            height: "50%",
            width: "100%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexDirection: "column",
        },
        adminButtonCont: {
            height: "10%",
            marginTop: "auto",
            width: "100%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexDirection: "column",
        },
        betSizeCont: {
            width: "100%",
        },
        sliderCont: {
            paddingTop: 10,
            width: "100%",
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
        },
        betTextFieldInput: {
            fontSize: "2.3vmin",
        },
        button: {
            width: "80%",
            maxHeight: "72px",
            height: "20%",
            minHeight: "36px",
            backgroundColor: "white",
        },
        adminButton: {
            width: "80%",
            maxHeight: "72px",
            height: "100%",
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

const KEY_ACTION_MAP = {
    [ActionType.BET]: "B",
    [ActionType.CHECK]: "K",
    [ActionType.CALL]: "A",
    [ActionType.FOLD]: "F",
    [ActionType.STARTGAME]: "S",
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

    const [betAmt, setBetAmt] = useState(0);

    const changeBetAmount = (newAmt) => {
        setBetAmt(Math.min(Math.floor(newAmt), max));
    };

    // TODO Redesign ClientWsMessageRequest type to better use typescripts features to better
    // represent the "one-of" idea
    function onClickActionButton(action) {
        WsServer.send({
            actionType: action,
            request: { type: action, amount: Number(betAmt) } as ClientWsMessageRequest,
        });
    }

    function onClickAdminButton(action) {
        WsServer.send({
            actionType: action,
            request: { } as ClientWsMessageRequest,
        });
    }

    return (
        <div className={classes.root}>
            <div className={classes.sizeAndBetActionsCont}>
                <div className={classes.betActionsCont}>
                    {actionButtons.map((button) => (
                        <ButtonWithKeyPress
                            keyPress={KEY_ACTION_MAP[button.action]}
                            variant="contained"
                            className={classnames(
                                classes.button,
                                classes[button.action]
                            )}
                            onClick={() => onClickActionButton(button.action)}
                            disabled={!toAct}
                        >
                            {`${button.label} (${
                                KEY_ACTION_MAP[button.action]
                            })`}
                        </ButtonWithKeyPress>
                    ))}
                    {sizingButtons.length > 0 ? (
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
                    ) : null}
                </div>
                <div className={classes.betSizeCont}>
                    <div className={classes.amounts}>
                        {sizingButtons.map((button) => (
                            <Button
                                variant="contained"
                                className={classes.sizeButton}
                                onClick={(e) => changeBetAmount(button.value)}
                            >
                                {button.label}
                            </Button>
                        ))}
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
                            {`${button.label} (${
                                KEY_ACTION_MAP[button.action]
                            })`}
                        </ButtonWithKeyPress>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ControllerComp;
