import React, { useState } from 'react';
import { Popper, TextareaAutosize, IconButton, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: '#17171980',
        color: 'white',
        width: 'fit-content',
        height: 'fit-content',
        position: 'absolute',
    },
    header: {
        width: '100%',
        height: 'fit-content',
        fontSize: '10px',
    },
    textArea: {
        resize: 'both',
        textAlign: 'left',
        overflow: 'hidden',
        width: `${theme.custom.PLAYER_WIDTH}vmin`,
        minWidth: '60px',
        fontSize: '1.6vmin',
        backgroundColor: '#17171980',
        color: 'rgb(220,210,230)',
    },
}));

function PlayerNotes(props) {
    const { anchorEl, togglePlayerNotes, playerName } = props;
    const classes = useStyles();
    const [notes, setNotes] = useState('');
    const [xPosition, setXPosition] = useState(null);
    const [yPosition, setYPosition] = useState(null);

    function handleDragStart(e) {
        let currentX = parseInt(e.currentTarget.style.left.split('p')[0]);
        let currentY = parseInt(e.currentTarget.style.top.split('p')[0]);

        if (currentX && currentY) {
            setXPosition(e.screenX - currentX);
            setYPosition(e.screenY - currentY);
        } else {
            setXPosition(e.screenX);
            setYPosition(e.screenY);
        }
    }

    function handleDrag(e) {
        console.log('offset number', e.currentTarget);
        let shiftX = e.screenX - xPosition;
        let shiftY = e.screenY - yPosition;

        if (Math.abs(shiftX) !== xPosition && Math.abs(shiftY) !== yPosition) {
            e.currentTarget.style.left = shiftX + 'px';
            e.currentTarget.style.top = shiftY + 'px';
        }
    }

    return (
        <Popper open={anchorEl} placement="bottom-start" anchorEl={anchorEl} style={{ zIndex: '1000' }}>
            <Paper
                className={classes.root}
                draggable={true}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragOver={(e) => {
                    e.preventDefault();
                }}
            >
                <div className={classes.header}>
                    <Typography style={{ fontSize: '1.8vmin', float: 'left' }}>{playerName} notes</Typography>

                    <IconButton
                        size="small"
                        style={{ float: 'right' }}
                        onClick={() => {
                            togglePlayerNotes(null);
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                <TextareaAutosize
                    className={classes.textArea}
                    value={notes}
                    onChange={(e) => {
                        setNotes(e.target.value);
                    }}
                ></TextareaAutosize>
            </Paper>
        </Popper>
    );
}

export default PlayerNotes;
