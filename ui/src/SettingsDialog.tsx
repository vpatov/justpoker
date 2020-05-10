import React, { useState, useContext } from 'react';
import { ThemePreferences, Background } from './shared/models/userPreferences';
import { ThemeSetter } from './App';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Select, MenuItem } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        radioGroup: {
            display: 'flex',
            flexDirection: 'row',
        },
        field: {
            width: 100,
            marginTop: 24,
            marginBottom: 24,
        },
    }),
);

function SettingsDialog(props) {
    const classes = useStyles();
    const { open, handleClose } = props;
    const { curTheme, themeSetter } = useContext(ThemeSetter);
    const [background, setBackground] = useState('');
    const [cards, setCards] = React.useState(false);

    console.log(background);
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
            <DialogTitle>{`Settings`}</DialogTitle>
            <DialogContent>
                <RadioGroup className={classes.radioGroup} value={cards} onChange={(_, v) => setCards(v === 'true')}>
                    <FormControlLabel value={true} control={<Radio />} label="Two Color" />
                    <FormControlLabel value={false} control={<Radio />} label="Four Color" />
                </RadioGroup>

                <Select
                    className={classes.field}
                    value={background}
                    onChange={(event) => setBackground(event.target.value as any)}
                >
                    <MenuItem value={Background.BLUE}>Blue</MenuItem>
                    <MenuItem value={Background.RED}>Red</MenuItem>
                    <MenuItem value={Background.GREEN}>Green</MenuItem>
                </Select>
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
