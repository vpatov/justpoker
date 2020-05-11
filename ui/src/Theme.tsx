import { createMuiTheme } from '@material-ui/core/styles';

import { PaletteType } from '@material-ui/core';
import lightBlue from '@material-ui/core/colors/lightBlue';
import lightGreen from '@material-ui/core/colors/lightGreen';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import indigo from '@material-ui/core/colors/indigo';
import red from '@material-ui/core/colors/red';
import grey from '@material-ui/core/colors/grey';
import teal from '@material-ui/core/colors/teal';
import blueGrey from '@material-ui/core/colors/blueGrey';
import orange from '@material-ui/core/colors/orange';

declare module '@material-ui/core/styles/createMuiTheme' {
    interface Theme {
        custom?: any;
    }
}

const CUSTOM_PALETTE = {
    primary: {
        main: teal['A400'],
        light: teal['100'],
    },
    secondary: {
        main: orange['A200'],
        light: orange['100'],
    },
};

export const CUSTOM_THEME = {
    custom: {
        HEARTS: {
            backgroundColor: red['A700'],
        },
        DIAMONDS: {
            backgroundColor: indigo[800],
        },
        SPADES: {
            backgroundColor: grey[800],
        },
        CLUBS: {
            backgroundColor: lightGreen[900],
        },
        HIDDEN: {
            backgroundColor: `${blueGrey[900]}`,
        },
        FOLDED: {
            opacity: 0.8,
            filter: 'grayscale(50%) brightness(0.4)',
        },
        BACKGROUND: {
            background: 'linear-gradient(360deg, rgba(50,50,63) 0%, rgb(25,25,40));',
        },
        TABLE: {
            border: `0.2vmin solid rgba(0,0,0,0.4)`,
            backgroundColor: 'black',
            background: `radial-gradient(circle, rgba(30,30,42,1) 0%, rgba(20,20,35,1) 56%, rgba(10,10,10,1) 100%);`,
        },
        STACK: {
            color: 'black',
            backgroundColor: blueGrey[200],
            borderRadius: '0.6vmin',
            boxShadow: '0 6px 14px 3px rgba(0,0,0,0.9)',
        },
        STACK_TO_ACT: {
            boxShadow: '0px 0px 10px 1px rgba(255,255,255,0.4)',
            backgroundColor: CUSTOM_PALETTE.primary.main,
            background: `linear-gradient(90deg, ${CUSTOM_PALETTE.primary.light} -33%, ${CUSTOM_PALETTE.primary.main} 50%, ${CUSTOM_PALETTE.primary.light} 133%)`,
        },
        STACK_WINNER: {
            boxShadow: '0 0px 10px rgba(255,255,255,0.8)',
            background: `linear-gradient(90deg, ${CUSTOM_PALETTE.secondary.light} -33%, ${CUSTOM_PALETTE.secondary.main} 50%, ${CUSTOM_PALETTE.secondary.light} 133%)`,
        },
        WINNING_CARD: {
            transition: 'boxShadow 0.4s ease-in-out, transform 0.4s ease-in-out ',
            border: '0.12vmin solid white',
            boxShadow: `0px 0px 6px 2px white`,
        },
        CONTROLLER: {
            backgroundColor: grey[900],
            background: `linear-gradient(rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);`,
            boxSizing: 'border-box',
            transition: 'box-shadow 0.4s ease-in-out;',
        },
        BET: {
            border: '1px solid white',
            backgroundColor: teal[200],
        },
        CHAT: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            boxShadow: ` 0 4px 4px 4px rgba(0,0,0,0.2)`,
        },
        ACTION_BUTTONS: {
            FOLD: {
                borderColor: red['A200'],
                color: red['A200'],
            },
            FOLD_QUEUED: {
                backgroundColor: red['A200'] + ' !important',
                color: 'black',
            },
            BET: {
                borderColor: green['A400'],
                color: green['A400'],
            },
            BET_QUEUED: {
                backgroundColor: green['A200'] + ' !important',
                color: 'black',
            },
            CHECK: {
                borderColor: blue['A200'],
                color: blue['A200'],
            },
            CHECK_QUEUED: {
                backgroundColor: blue['A200'] + ' !important',
                color: 'black',
            },
            CALL: {
                borderColor: blue['A200'],
                color: blue['A200'],
            },
            CALL_QUEUED: {
                backgroundColor: blue['A200'] + ' !important',
                color: 'black',
            },
            STARTGAME: {
                borderColor: lightGreen['A400'],
                color: lightGreen['A400'],
            },
            STOPGAME: {
                borderColor: red[900],
                color: red[900],
            },
        },
    },
    typography: {
        fontFamily: 'Futura, Avenir, AkzidenzGrotesk, Questrial, Helvetica, sans-serif',
    },
    palette: {
        type: 'dark' as PaletteType,
        ...CUSTOM_PALETTE,
    },
    overrides: {
        MuiTypography: {
            root: {
                color: 'inherit',
                fontSize: '1vmin',
            },
        },
        MuiOutlinedInput: {
            root: {
                '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
                    borderColor: teal['A200'],
                },
            },
            input: {
                padding: '1vmin',
                fontSize: '1.5vmin',
            },
            multiline: {
                padding: '1vmin',
                fontSize: '1.4vmin',
            },
        },
        MuiButton: {
            root: {
                '&:hover': {
                    '&:after': {
                        content: "''",
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                    },
                },
                minWidth: '24px',
            },
            outlined: {
                padding: '0.6vmin 0.8vmin',
            },
        },
        MuiIconButton: {
            root: {
                padding: '1vmin',
            },
        },
        MuiSvgIcon: {
            root: {
                width: '2.3vmin',
                height: '2.3vmin',
            },
        },
        MuiCheckbox: {
            root: {
                padding: '0.8vmin',
            },
        },
    },
};

export const Theme = createMuiTheme(CUSTOM_THEME);
