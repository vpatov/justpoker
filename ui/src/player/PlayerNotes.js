import React, {useState} from 'react';
import {Popper, TextareaAutosize, IconButton, Paper} from '@material-ui/core';
import TonalityIcon from '@material-ui/icons/Tonality';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
    root: {backgroundColor: '#171719', color: 'white', width: 'fit-content', height: 'fit-content'},
    header: {
        // width: `${theme.custom.PLAYER_WIDTH}vmin`,
        width: '100%',
        height:'fit-content',
        fontSize: '10px'
    },
    textArea: {
        resize: 'both',
        textAlign: 'left',
        overflow: 'hidden',
        width: `${theme.custom.PLAYER_WIDTH}vmin`,
        minWidth: '60px',
        fontSize: '1.6vmin',
        backgroundColor: '#171719',
        color: 'rgb(220,210,230)'
    },
}));


function PlayerNotes(props){
    const {anchorEl, togglePlayerNotes} = props
    const classes = useStyles()
    const [dockSide, setDockSide] = useState('bottom-start')
    const [notes, setNotes] = useState('')

    return(
        <Popper open={anchorEl} placement={dockSide} anchorEl={anchorEl}>
            <Paper className={classes.root}>
                <div className={classes.header}>
                    {/* <IconButton size='small' onClick={()=>{setDockSide('left-start')}}><TonalityIcon fontSize="small" style={{transform: 'rotate(180deg)'}} /></IconButton> */}
                    <IconButton size='small' onClick={()=>{setDockSide('bottom-start')}}><TonalityIcon fontSize="small" style={{transform: 'rotate(90deg)'}}/></IconButton>
                    <IconButton size='small' onClick={()=>{setDockSide('right-start')}}><TonalityIcon fontSize="small" style={{transform: 'rotate(0deg)'}}/></IconButton>

                    <IconButton size='small' style={{float: 'right'}} onClick={()=>{togglePlayerNotes(null)}}><CloseIcon fontSize="small" /></IconButton>
                </div>

                <TextareaAutosize
                className={classes.textArea}
                value={notes}
                onChange={(e)=>{setNotes(e.target.value)}}>
                
                </TextareaAutosize>
            </Paper>
        </Popper>
    );
}

export default PlayerNotes;