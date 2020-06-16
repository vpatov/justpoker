import React from 'react';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import classnames from 'classnames';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Popper from '@material-ui/core/Popper';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import IconButton from '@material-ui/core/IconButton';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {},
        popper: {
            zIndex: 10,
        },
    }),
);

export default function EmojiPicker(props) {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [open, setOpen] = React.useState(false);
    const classes = useStyles();

    const { placement = 'top', className, ...rest } = props;
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => !prev);
    };
    const handleClickAway = (event) => {
        setOpen(false);
    };

    return (
        <>
            <IconButton className={classnames(classes.button, className)} onClick={handleClick}>
                <EmojiEmotionsIcon />
            </IconButton>
            <Popper open={open} anchorEl={anchorEl} placement={placement} className={classes.popper}>
                <ClickAwayListener onClickAway={handleClickAway}>
                    <Picker {...rest} theme="dark" showPreview={false} showSkinTones={false} />
                </ClickAwayListener>
            </Popper>
        </>
    );
}
