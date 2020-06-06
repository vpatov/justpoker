import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { WsServer } from './api/ws';
import { ClientActionType } from './shared/models/api';
import TextFieldWrap from './reuseable/TextFieldWrap';
import IconPicker from './reuseable/IconPicker';

import { makeStyles } from '@material-ui/core/styles';
import { ClientWsMessageRequest } from './shared/models/api';
import { Dialog, DialogContent, DialogActions, Button } from '@material-ui/core';
import { selectGameParameters } from './store/selectors';
import { AvatarKeys, getRandomAvatarKey } from './shared/models/assets';
import Avatar from './Avatar';
import { useStickyState } from './utils';

const useStyles = makeStyles((theme) => ({
    nameRow: {
        width: '100%',
        display: 'flex',
    },
    nameField: {
        marginLeft: '1vmin',
        flexGrow: 1,
    },
    field: {
        marginTop: '3vmin',
        width: '35%',
    },
    sit: {
        fontSize: '1.3vmin',
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
}));

const NAME_LOCAL_STORAGE_KEY = 'jp-last-used-name';
const AVATAR_LOCAL_STORAGE_KEY = 'jp-last-used-avatar';

function OpenSeatDialog(props) {
    const classes = useStyles();
    const { onClose, open, seatNumber } = props;
    const [name, setName] = useStickyState('', NAME_LOCAL_STORAGE_KEY);
    const [avatarKey, SET_avatarKey] = useStickyState(getRandomAvatarKey(), AVATAR_LOCAL_STORAGE_KEY);
    const { maxBuyin, minBuyin } = useSelector(selectGameParameters);

    const [buyin, setBuyin] = useState<number | undefined>();

    function onChangeBuyin(event: any) {
        setBuyin(event.target.value);
    }

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

    function onSubmitSitDownForm() {
        WsServer.send({
            actionType: ClientActionType.JOINTABLEANDSITDOWN,
            request: {
                avatarKey: avatarKey,
                name,
                buyin: Number(buyin),
                seatNumber: seatNumber,
            } as ClientWsMessageRequest,
        });
        onClose();
    }

    function onPressEnter(event: any) {
        if (event.key === 'Enter' && !formInvalid()) {
            event.preventDefault();
            onSubmitSitDownForm();
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
                        id="ID_NameField"
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
                <TextFieldWrap
                    variant="standard"
                    type="number"
                    className={classes.field}
                    value={buyin}
                    label="Buy In"
                    onChange={onChangeBuyin}
                    inputProps={{
                        step: 1,
                    }}
                    max={maxBuyin}
                    error={invalidBuyin()}
                    helperText={invalidBuyin() ? `Min Buyin is ${minBuyin}` : ''}
                    autoFocus
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button id="ID_SitDownButton" disabled={formInvalid()} onClick={onSubmitSitDownForm} color="primary">
                    Sit Down
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default OpenSeatDialog;
