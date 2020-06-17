import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { WsServer } from '../api/ws';

import FieldWithMinMaxButtons from '../reuseable/FieldWithMinMaxButtons';
import TextFieldWrap from '../reuseable/TextFieldWrap';
import IconPicker from '../reuseable/IconPicker';

import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogContent, DialogActions, DialogTitle, Button } from '@material-ui/core';
import { selectGameParameters, globalGameStateSelector } from '../store/selectors';
import { AvatarKeys, getRandomAvatarKey } from '../shared/models/ui/assets';
import Avatar from '../reuseable/Avatar';
import { useStickyState } from '../utils';
import { SELENIUM_TAGS } from '../shared/models/test/seleniumTags';

const useStyles = makeStyles((theme) => ({
    nameRow: {
        width: '100%',
        display: 'flex',
    },
    betRow: {
        width: '100%',
        display: 'flex',
        alignItems: 'end',
    },
    nameField: {
        marginLeft: '1vmin',
        flexGrow: 1,
    },
    field: {
        marginTop: '3vmin',
    },
    dialogPaper: {
        height: '80vh',
        maxHeight: 360,
    },
    avatarIcon: {
        width: '6vmin',
        height: '6vmin',
    },
    pickerMenu: {
        width: '30vmin',
    },
    minMaxButtonCont: {
        display: 'flex',
        flexDirection: 'column',
    },
    minMaxButton: {},
}));

const NAME_LOCAL_STORAGE_KEY = 'jp-last-used-name';
const AVATAR_LOCAL_STORAGE_KEY = 'jp-last-used-avatar';

function JoinGameDialog(props) {
    const classes = useStyles();
    const { handleClose, open } = props;
    const [name, setName] = useStickyState('', NAME_LOCAL_STORAGE_KEY);
    const [avatarKey, SET_avatarKey] = useStickyState(getRandomAvatarKey(), AVATAR_LOCAL_STORAGE_KEY);
    const { minBuyin } = useSelector(selectGameParameters);
    let maxBuyin = useSelector(globalGameStateSelector).computedMaxBuyin;

    const [buyin, setBuyin] = useState<number>(maxBuyin);

    function invalidBuyin() {
        if (buyin === undefined) {
            return false;
        }
        return buyin < minBuyin || buyin > maxBuyin;
    }

    function invalidName() {
        return name === '';
    }

    function formInvalid() {
        return invalidBuyin() || invalidName() || buyin === undefined;
    }

    function onJoin() {
        WsServer.sendJoinGameMessage(name, buyin, avatarKey);
        handleClose();
    }

    function onJoinAndSit() {
        WsServer.sendJoinGameAndJoinTableMessage(name, buyin, avatarKey);
        handleClose();
    }

    function onPressEnter(event: any) {
        if (event.key === 'Enter' && !formInvalid()) {
            event.preventDefault();
            onJoinAndSit();
        }
    }

    function getPickerOptions() {
        return Object.keys(AvatarKeys).map((key, index) => ({
            icon: <Avatar key={`${key}${index}`} avatarKey={key} className={classes.avatarIcon} />,
            avatarKey: key,
        }));
    }

    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            onKeyPress={(event) => onPressEnter(event)}
            classes={{ paper: classes.dialogPaper }}
        >
            <DialogTitle>Join Game</DialogTitle>
            <DialogContent>
                <div className={classes.nameRow}>
                    <IconPicker
                        options={getPickerOptions()}
                        paperClass={classes.pickerMenu}
                        initIcon={<Avatar avatarKey={avatarKey} className={classes.avatarIcon} />}
                        onSelect={(option) => {
                            SET_avatarKey(option.avatarKey);
                        }}
                        placement="left"
                        size={'6vmin'}
                    />

                    <TextFieldWrap
                        className={classes.nameField}
                        id={SELENIUM_TAGS.IDS.NAME_FIELD}
                        label="Name"
                        type="text"
                        fullWidth
                        onChange={(event) => {
                            setName(event.target.value);
                        }}
                        value={name}
                        variant="standard"
                        maxChars={24}
                    />
                </div>

                <FieldWithMinMaxButtons
                    type="number"
                    className={classes.field}
                    value={buyin}
                    label="Buy In"
                    onChange={(e) => setBuyin(e.target.value)}
                    inputProps={{
                        step: 1,
                    }}
                    min={minBuyin}
                    max={maxBuyin}
                    error={invalidBuyin()}
                    helperText={invalidBuyin() ? `Min Buyin is ${minBuyin}` : ''}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button disabled={formInvalid()} onClick={onJoin}>
                    Join
                </Button>
                <Button
                    id={SELENIUM_TAGS.IDS.JOIN_AND_SIT_BUTTON}
                    disabled={formInvalid()}
                    onClick={onJoinAndSit}
                    color="primary"
                >
                    Join and Sit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default JoinGameDialog;
