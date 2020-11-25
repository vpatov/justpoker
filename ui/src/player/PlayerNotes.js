import React from 'react';
import {Popper, TextareaAutosize, SvgIcon} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
    root: {
        // width: `${theme.custom.PLAYER_WIDTH}vmin`,
        width: '100%',
        height:'fit-content',
        backgroundColor: 'green',
        fontSize: '10px'
    },
    textArea: {
        resize: 'both',
        textAlign: 'left',
        overflow: 'hidden',
        width: `${theme.custom.PLAYER_WIDTH}vmin`,
    }
}));



function PlayerNotes(props){
    const {anchorEl} = props
    const classes = useStyles()




    return(
        <Popper open={anchorEl} placement='bottom-start' anchorEl={anchorEl}>
            <div style={{backgroundColor: 'black', width: 'fit-content', height: 'fit-content'}}>
                <div className={classes.root}>Player Notes
                    {/* <img src={require('./contrast.png')} /> */}
                    <button>X</button>
                </div>

                <TextareaAutosize
                className={classes.textArea}
                rowsMax={4}
                aria-label="maximum height"
                placeholder="Maximum 4 rows"
                defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua."
                >
                </TextareaAutosize>
            </div>
        </Popper>
    );
}

export default PlayerNotes;