import React, { useState, useContext } from 'react';
import { ThemePreferences } from '../shared/models/ui/userPreferences';
import { ThemeSetter } from '../root/App';
import InputLabel from '@material-ui/core/InputLabel';
import capitalize from 'lodash/capitalize';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Select, MenuItem, Paper, ClickAwayListener, Checkbox } from '@material-ui/core';
import { Background } from '../style/colors';
import { ChromePicker } from 'react-color';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            display: 'flex',
            flexDirection: 'row',
        },
        radioGroup: {
            display: 'flex',
            flexDirection: 'row',
        },
        field: {
            width: 200,
            margin: '0px 12px',
        },
        menuRow: {
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            width: '100%',
        },

        sample: {
            marginLeft: 'auto',
            height: '2vmin',
            width: '2vmin',
            boxShadow: theme.shadows[3],
            borderRadius: '0.4vmin',
        },
        pickerCont: {
            zIndex: 1400,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
        },
        checkbox: {
            height: '2vmin',
            width: '2vmin',
            margin: 'auto auto',
        },
    }),
);

function SettingsDialog(props) {
    const classes = useStyles();
    const { open, handleClose } = props;
    const { curPrefs: curfPrefs, themeSetter } = useContext(ThemeSetter);
    const [background, SET_background] = useState(curfPrefs.backgroundColor);
    const [twoColor, SET_twoColor] = React.useState(curfPrefs.twoColor);

    const [showColorPicker, SET_showColorPicker] = React.useState(false);
    const [customColor, SET_customColor] = React.useState('#FFFFFF');

    const [coloredCardBackground, SET_coloredCardBackground] = React.useState(curfPrefs.coloredCardBackground);

    function createThemePreferences(): ThemePreferences {
        const prefs = {
            twoColor,
            backgroundColor: background as any,
            coloredCardBackground,
        };
        return prefs;
    }
    const onSave = () => {
        const p = createThemePreferences();
        themeSetter(p);
        handleClose();
    };

    const onClickCustomColor = () => {
        SET_showColorPicker(true);
    };
    const onSelectColor = (event) => {
        SET_background(event.target.value);
    };

    const renderColorPicker = () => {
        return (
            <ClickAwayListener
                onClickAway={() => {
                    SET_showColorPicker(false);
                }}
            >
                <Paper className={classes.pickerCont}>
                    <ChromePicker
                        color={customColor}
                        disableAlpha
                        onChange={(color) => {
                            SET_customColor(color.hex);
                            SET_background(color.hex);
                        }}
                    />
                </Paper>
            </ClickAwayListener>
        );
    };

    const renderUserSettingsDialog = () => {
        return (
            <Dialog open={open} maxWidth="md" fullWidth>
                <DialogTitle>{`User Settings`}</DialogTitle>
                <DialogContent className={classes.content}>
                    <FormControl>
                        <FormLabel>Suit Color</FormLabel>
                        <RadioGroup
                            className={classes.radioGroup}
                            value={twoColor}
                            onChange={(_, v) => SET_twoColor(v === 'true')}
                        >
                            <FormControlLabel value={true} control={<Radio />} label="Two Color" />
                            <FormControlLabel value={false} control={<Radio />} label="Four Color" />
                        </RadioGroup>
                    </FormControl>
                    <FormControl className={classes.field}>
                        <InputLabel>Background Color</InputLabel>
                        <Select value={background} onChange={onSelectColor}>
                            {Object.entries(Background).map(([k, v]) => (
                                <MenuItem key={k} value={v}>
                                    <div className={classes.menuRow}>
                                        {capitalize(k)}
                                        <div className={classes.sample} style={{ backgroundColor: v }} />
                                    </div>
                                </MenuItem>
                            ))}

                            <MenuItem key={'customColor'} value={customColor}>
                                <div className={classes.menuRow} onClick={onClickCustomColor}>
                                    Custom Color
                                    <div className={classes.sample} style={{ backgroundColor: customColor }} />
                                </div>
                            </MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel>
                            Colored Card Background?
                        </FormLabel>
                        <Checkbox
                            className={classes.checkbox}
                            checked={coloredCardBackground}
                            onChange={() => SET_coloredCardBackground(!coloredCardBackground)}
                            name="coloredCardBackgroundCheckbox"
                            color="primary"
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={onSave} color="primary" autoFocus>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <>
            {showColorPicker ? renderColorPicker() : null}
            {renderUserSettingsDialog()}
        </>
    );
}

export default SettingsDialog;
