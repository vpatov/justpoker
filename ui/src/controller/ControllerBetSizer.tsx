import React, { Fragment } from 'react';
import classnames from 'classnames';

import { createStyles, makeStyles, Theme, withStyles, useTheme } from '@material-ui/core/styles';
import TextFieldWrap from '../reuseable/TextFieldWrap';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import { BettingRoundActionType } from '../shared/models/game/betting';
var Color = require('color');

const ThiccSlider = withStyles({
    root: {
        height: 8,
    },
    thumb: {
        height: '1.6vmin',
        width: '1.6vmin',
        marginTop: '-0.4vmin',
        // marginLeft: '1vmin',
    },
    track: {
        height: '0.8vmin',
        borderRadius: 4,
    },
    rail: {
        height: '0.8vmin',
        borderRadius: 4,
    },
})(Slider);

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        // root container
        bettingCont: {
            marginRight: '2vmin',
            height: '100%',
            width: '50%',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexWrap: 'wrap',
            flexDirection: 'column',
        },

        // top row
        plusMinusButtonAndTextfieldCont: {
            width: '100%',
            display: 'flex',
        },
        // textfield
        betTextField: {
            flexGrow: 1,
            width: '6vmin',
            margin: '0 -1px',
        },
        betTextFieldInput: {
            fontSize: '1.5vmin',
        },
        betTextFieldRoot: {
            borderRadius: 0,
            boxSizing: 'border-box',
        },
        // plus/minus buttons
        plusButton: {
            padding: 0,
            fontSize: '2vmin',
            fontWeight: 'bold',
            width: '2vw',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeft: 'none',
        },
        minusButton: {
            padding: 0,
            fontSize: '2vmin',
            fontWeight: 'bold',
            width: '2vw',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderRight: 'none',
        },

        // middle row
        // slider
        slider: {
            width: '100%',
            margin: '-1.6vmin 0px',
        },

        // bottom row
        // lower bet sizing buttons 1/2, 3/4, pot, all in, etc...
        sizingButtonsCont: {
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            width: '100%',
        },
        sizeButtonGroupCont: {
            width: '100%',
        },
        sizeButton: {
            minWidth: 0,
            fontSize: '1vmin',
            padding: '0.6vmin 0vmin',
            flexGrow: 1,
        },
    }),
);

function ControllerBetSizer(props) {
    const classes = useStyles();
    const theme = useTheme();
    const { sizingButtons, min, max, value, onChange, onClickActionButton, betInputRef } = props;

    function isBetValid() {
        if (0 < value && value < min) return true;
        return false;
    }

    function computeColor() {
        const baseColor = Color(theme.palette.primary.main);
        const percent = value / max;
        return baseColor.desaturate(1 - percent).toString();
    }

    function onPressEnter(event: any) {
        if (event.key === 'Enter') {
            event.preventDefault();
            onClickActionButton(BettingRoundActionType.BET);
        }
    }
    return (
        <div className={classes.bettingCont}>
            {sizingButtons.length > 0 ? (
                <Fragment>
                    <div className={classes.plusMinusButtonAndTextfieldCont}>
                        <Button
                            variant="outlined"
                            onClick={() => onChange(value - min)}
                            className={classnames(classes.minusButton)}
                        >
                            -
                        </Button>
                        <TextFieldWrap
                            className={classes.betTextField}
                            InputProps={{
                                classes: {
                                    root: classes.betTextFieldRoot,
                                    input: classes.betTextFieldInput,
                                },
                            }}
                            onChange={(event) => onChange(event.target.value)}
                            min={0}
                            max={max}
                            value={value}
                            type="number"
                            autoFocus={true}
                            error={isBetValid()}
                            helperText={isBetValid() ? `Min Bet is ${min}` : ''}
                            onKeyPress={(event) => onPressEnter(event)}
                            inputRef={betInputRef}
                        />
                        <Button
                            variant="outlined"
                            onClick={() => onChange(value + min)}
                            className={classnames(classes.plusButton)}
                        >
                            +
                        </Button>
                    </div>
                    <ThiccSlider
                        className={classes.slider}
                        onChange={(e, val) => onChange(val as number)}
                        value={value}
                        min={min}
                        max={max}
                        valueLabelDisplay="off"
                        style={{ color: computeColor() }}
                    />
                    <div className={classes.sizingButtonsCont}>
                        <ButtonGroup className={classes.sizeButtonGroupCont}>
                            {sizingButtons.map((button) => (
                                <Button
                                    variant="outlined"
                                    className={classes.sizeButton}
                                    onClick={(e) => onChange(button.value)}
                                >
                                    {button.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </div>
                </Fragment>
            ) : null}
        </div>
    );
}

export default ControllerBetSizer;
