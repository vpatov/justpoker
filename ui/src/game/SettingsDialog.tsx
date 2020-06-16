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
import { Select, MenuItem } from '@material-ui/core';
import { Background } from '../style/colors';

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
    }),
);

function SettingsDialog(props) {
    const classes = useStyles();
    const { open, handleClose } = props;
    const { curfPrefs, themeSetter } = useContext(ThemeSetter);
    const [background, setBackground] = useState(curfPrefs.background);

    const [cards, setCards] = React.useState(curfPrefs.twoColor);

    function createThemePreferences(): ThemePreferences {
        const prefs = {
            twoColor: cards,
            background: background as any,
        };
        return prefs;
    }
    const onSave = () => {
        const p = createThemePreferences();
        themeSetter(p);
        handleClose();
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth>
            <DialogTitle>{`User Settings`}</DialogTitle>
            <DialogContent className={classes.content}>
                <FormControl>
                    <FormLabel>Suit Color</FormLabel>
                    <RadioGroup
                        className={classes.radioGroup}
                        value={cards}
                        onChange={(_, v) => setCards(v === 'true')}
                    >
                        <FormControlLabel value={true} control={<Radio />} label="Two Color" />
                        <FormControlLabel value={false} control={<Radio />} label="Four Color" />
                    </RadioGroup>
                </FormControl>
                <FormControl className={classes.field}>
                    <InputLabel>Background Color</InputLabel>
                    <Select value={background} onChange={(event) => setBackground(event.target.value as any)}>
                        {Object.entries(Background).map(([k, v]) => (
                            <MenuItem key={k} value={v}>
                                {capitalize(k)}
                            </MenuItem>
                        ))}
                    </Select>
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
}

export default SettingsDialog;
