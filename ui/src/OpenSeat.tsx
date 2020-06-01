import React, { useState, Fragment } from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import { WsServer } from './api/ws';
import { ClientActionType } from './shared/models/api';
import TextFieldWrap from './reuseable/TextFieldWrap';

import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import Typography from '@material-ui/core/Typography';
import { ClientWsMessageRequest } from './shared/models/api';
import { Dialog, DialogContent, DialogActions, Button } from '@material-ui/core';
import { selectGameParameters } from './store/selectors';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '8vmin',
        height: '8vmin',
        border: `2px solid white`,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        color: 'white',
        '&:hover': {
            backgroundColor: grey[900],
        },
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
}));

const NAME_LOCAL_STORAGE_KEY = 'jp-last-used-name';

function OpenSeat(props) {
    const classes = useStyles();
    const { className, style, seatNumber } = props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState(localStorage.getItem(NAME_LOCAL_STORAGE_KEY) || '');
    const { maxBuyin, minBuyin } = useSelector(selectGameParameters);

    const [buyin, setBuyin] = useState<number | undefined>();

    const dialogClose = () => {
        setDialogOpen(false);
    };

    function onClickSitDown() {
        setDialogOpen(true);
    }

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
                name,
                buyin: Number(buyin),
                seatNumber: seatNumber,
            } as ClientWsMessageRequest,
        });
        setDialogOpen(false);
    }

    function onPressEnter(event: any) {
        if (event.key === 'Enter' && !formInvalid()) {
            event.preventDefault();
            onSubmitSitDownForm();
        }
    }

    return (
        <Fragment>
            <IconButton
                color="primary"
                className={classnames(classes.root, className, 'CLASS_OpenSeatButton')}
                style={style}
                onClick={onClickSitDown}
            >
                <Typography className={classes.sit}>Sit Here</Typography>
            </IconButton>
            <Dialog
                open={dialogOpen}
                maxWidth="xs"
                fullWidth
                onKeyPress={(event) => onPressEnter(event)}
                classes={{ paper: classes.dialogPaper }}
            >
                <DialogContent>
                    <TextFieldWrap
                        autoFocus
                        id="ID_NameField"
                        label="Name"
                        type="text"
                        fullWidth
                        onChange={(event) => {
                            setName(event.target.value);
                            localStorage.setItem(NAME_LOCAL_STORAGE_KEY, event.target.value);
                        }}
                        value={name}
                        variant="standard"
                        maxChars={24}
                    />
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={dialogClose}>Cancel</Button>
                    <Button
                        id="ID_SitDownButton"
                        disabled={formInvalid()}
                        onClick={onSubmitSitDownForm}
                        color="primary"
                    >
                        Sit Down
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default OpenSeat;
